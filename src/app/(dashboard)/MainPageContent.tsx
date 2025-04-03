'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function MainPageContent({ user }: { user: { id: string; name: string; email: string } }) {
    const [posts, setPosts] = useState<
        {
            id: string;
            message: string;
            image: string | null;
            createdAt: string;
            signature: string | null;
            user: { name: string; id: string };
            isVerified?: boolean | null;
        }[]
    >([]);
    const [message, setMessage] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [signingPostId, setSigningPostId] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const skip = useRef(0);
    const observer = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter();

    const hasMorePostsRef = useRef(hasMorePosts);
    const fetchingMoreRef = useRef(fetchingMore);

    useEffect(() => {
        hasMorePostsRef.current = hasMorePosts;
    }, [hasMorePosts]);

    useEffect(() => {
        fetchingMoreRef.current = fetchingMore;
    }, [fetchingMore]);

    const fetchPosts = useCallback(async () => {
        if (!hasMorePostsRef.current || fetchingMoreRef.current) return;

        setFetchingMore(true);
        try {
            const response = await fetch(`/api/posts/posts?skip=${skip.current}&take=10`);
            if (!response.ok) throw new Error('Failed to fetch posts.');
            const newPosts = await response.json();

            const verifiedPosts = await Promise.all(
                newPosts.map(async (post: any) => {
                    if (post.signature) {
                        const verifyResponse = await fetch('/api/posts/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ postId: post.id }),
                        });
                        const verifyResult = await verifyResponse.json();
                        return { ...post, isVerified: verifyResult.valid };
                    }
                    return { ...post, isVerified: null };
                })
            );

            setPosts((prev) => [...prev, ...verifiedPosts]);
            if (newPosts.length < 10) {
                setHasMorePosts(false);
            }
            skip.current += newPosts.length;
        } catch (error) {
            console.error('Error fetching posts:', error);
            setErrorMessage('Failed to fetch posts. Please try again.');
        } finally {
            setFetchingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        const currentObserver = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMorePostsRef.current && !fetchingMoreRef.current) {
                    fetchPosts();
                }
            },
            { rootMargin: '100px' }
        );

        if (sentinelRef.current) {
            currentObserver.observe(sentinelRef.current);
        }
        observer.current = currentObserver;

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [fetchPosts]);

    const handleSignOut = async () => {
        try {
            const response = await fetch('/api/auth/signout', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to sign out.');
            }

            router.push('/signin');
        } catch (error) {
            console.error('Error signing out:', error);
            setErrorMessage('Failed to sign out. Please try again.');
        }
    };

    const applyFormatting = (syntax: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const { selectionStart, selectionEnd } = textarea;
        const selectedText = textarea.value.slice(selectionStart, selectionEnd);

        if (!selectedText.trim()) {
            setErrorMessage('Please select text to format.');
            return;
        }

        const formattedText = `${syntax}${selectedText}${syntax}`;
        const newMessage =
            textarea.value.slice(0, selectionStart) + formattedText + textarea.value.slice(selectionEnd);

        setMessage(newMessage);

        setTimeout(() => {
            textarea.setSelectionRange(selectionStart + syntax.length, selectionEnd + syntax.length);
            textarea.focus();
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey) {
            if (e.key === 'b') {
                e.preventDefault();
                applyFormatting('**');
            } else if (e.key === 'i') {
                e.preventDefault();
                applyFormatting('_');
            } else if (e.key === 'd') {
                e.preventDefault();
                applyFormatting('~~');
            }
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            setErrorMessage('Message is required. Please write something.');
            return;
        }

        if (message.length > 1000) {
            setErrorMessage('Message is too long. It cannot exceed 1000 characters.');
            return;
        }

        setLoading(true);

        try {
            const base64Image = image
                ? await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (reader.result && typeof reader.result === 'string') {
                            resolve(reader.result);
                        } else {
                            reject(new Error('Failed to read image as base64 string.'));
                        }
                    };
                    reader.onerror = () => reject(new Error('Failed to read image file.'));
                    reader.readAsDataURL(image);
                })
                : null;

            const response = await fetch('/api/posts/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    message,
                    image: base64Image,
                }),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                if (errorResponse.error) {
                    const formattedErrors = errorResponse.errors
                        .map((err: { message: string }) => err.message)
                        .join(' ');
                    setErrorMessage(formattedErrors);
                } else {
                    throw new Error('Failed to create post.');
                }
                return;
            }

            const newPost = await response.json();
            setPosts((prev) => [
                {
                    ...newPost,
                    user: { id: user.id, name: user.name },
                    signature: null,
                    isVerified: null,
                },
                ...prev,
            ]);
            setMessage('');
            setImage(null);
            setErrorMessage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error creating post:', error);
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('An unknown error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignPost = async () => {
        if (!signingPostId || !password) return;

        try {
            const response = await fetch(`/api/posts/posts`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: signingPostId, password }),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.error || 'Failed to sign the post.');
            }

            setPosts((prev) =>
                prev.map((post) =>
                    post.id === signingPostId
                        ? { ...post, signature: 'Signed', isVerified: true }
                        : post
                )
            );

            setSigningPostId(null);
            setPassword('');
            setPasswordVisible(false);
            setShowPasswordModal(false);
        } catch (error) {
            console.error('Error signing post:', error);
            alert('Failed to sign the post. Please try again.');
        }
    };

    const closeModal = () => {
        setShowPasswordModal(false);
        setPassword('');
        setPasswordVisible(false);
        setSigningPostId(null);
    };

    return (
        <div className="max-w-3xl w-full bg-[#2c2c2c] rounded-lg shadow-md p-6 text-center">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#e0e0e0]">Welcome, {user.name}!</h1>
                <p className="text-sm text-[#a0a0a0] mt-2">You are signed in as {user.email}.</p>
            </div>

            {errorMessage && (
                <div className="text-red-500 text-sm text-center mb-4">
                    <p>{errorMessage}</p>
                </div>
            )}

            <div className="flex flex-col gap-3 mb-6">
                <button
                    onClick={handleSignOut}
                    className="w-full py-2 rounded bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e0e0e0]"
                >
                    Sign Out
                </button>
                <button
                    onClick={() => router.push('/change-password')}
                    className="w-full py-2 rounded bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e0e0e0]"
                >
                    Change Password
                </button>
            </div>

            <form onSubmit={handleCreatePost} className="mb-6">
                <div className="flex justify-center gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => applyFormatting('**')}
                        className="px-3 py-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e0e0e0] rounded"
                    >
                        Bold
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormatting('_')}
                        className="px-3 py-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e0e0e0] rounded"
                    >
                        Italic
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormatting('~~')}
                        className="px-3 py-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e0e0e0] rounded"
                    >
                        Strikethrough
                    </button>
                </div>
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write your message..."
                    className="w-full p-3 rounded bg-[#1c1c1c] text-[#e0e0e0] mb-4"
                    rows={3}
                ></textarea>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="w-full text-sm mb-4"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e0e0e0]"
                >
                    {loading ? 'Posting...' : 'Post'}
                </button>
            </form>

            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="bg-[#1c1c1c] p-4 rounded shadow">
                        <h3 className="font-bold text-[#e0e0e0]">{post.user?.name || 'Unknown User'}</h3>
                        <div dangerouslySetInnerHTML={{__html: post.message}}></div>
                        {post.image && (
                            <img
                                src={post.image}
                                alt="Post image"
                                className="mt-4 rounded-lg w-full h-auto object-cover"
                                style={{maxHeight: '300px', objectFit: 'contain'}}
                            />
                        )}
                        <p className="text-xs text-[#a0a0a0] mt-2">
                            {new Date(post.createdAt).toLocaleString()}
                        </p>
                        <p
                            className={`text-xs font-bold mt-2 ${
                                post.signature
                                    ? post.isVerified
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                    : 'text-gray-400'
                            }`}
                        >
                            {post.signature ? (post.isVerified ? 'Signature Verified' : 'Signature Not Valid') : 'Not Signed'}
                        </p>
                        {post.user?.id === user.id && !post.signature && (
                            <button
                                onClick={() => {
                                    setSigningPostId(post.id);
                                    setShowPasswordModal(true);
                                }}
                                className="mt-2 py-1 px-3 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e0e0e0] rounded transition"
                            >
                                Sign Post
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-lg w-96 text-[#e0e0e0]">
                        <h2 className="text-lg font-bold mb-4">Enter Password to Sign</h2>
                        <div className="relative">
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded bg-[#2c2c2c] text-[#e0e0e0] pr-10"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2 text-[#a0a0a0] hover:text-[#e0e0e0] focus:outline-none"
                                onClick={() => setPasswordVisible((prev) => !prev)}
                            >
                                {passwordVisible ? '👁️' : '🔒'}
                            </button>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={handleSignPost}
                                className="py-2 px-4 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e0e0e0] rounded transition"
                            >
                                Sign Post
                            </button>
                            <button
                                onClick={closeModal}
                                className="py-2 px-4 bg-[#4a4a4a] hover:bg-[#5a5a5a] text-[#e0e0e0] rounded transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}