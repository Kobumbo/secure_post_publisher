import { useState, useEffect } from "react";

export default function PasswordStrengthBar({ password }: { password: string }) {
    const [requirements, setRequirements] = useState({
        minLength: false,
        lowercase: false,
        uppercase: false,
        digit: false,
        special: false,
    });

    const [strengthLabel, setStrengthLabel] = useState("Very Weak");

    useEffect(() => {
        const checkPasswordStrength = (password: string) => {
            const updatedRequirements = {
                minLength: password.length >= 8,
                lowercase: /[a-z]/.test(password),
                uppercase: /[A-Z]/.test(password),
                digit: /[0-9]/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            };

            setRequirements(updatedRequirements);

            const fulfilledCount = Object.values(updatedRequirements).filter(Boolean).length;

            // Set strength label based on the number of fulfilled requirements
            if (fulfilledCount === 0) setStrengthLabel("Very Weak");
            else if (fulfilledCount === 1) setStrengthLabel("Weak");
            else if (fulfilledCount === 2) setStrengthLabel("Moderate");
            else if (fulfilledCount === 3) setStrengthLabel("Good");
            else if (fulfilledCount === 4) setStrengthLabel("Strong");
            else if (fulfilledCount === 5) setStrengthLabel("Very Strong");
        };

        checkPasswordStrength(password);
    }, [password]);

    const fulfilledRequirements = Object.values(requirements).filter(Boolean).length;
    const strength = (fulfilledRequirements / 5) * 100;

    return (
        <div className="mt-4">
            <div className="h-2 bg-gray-300 rounded">
                <div
                    className={`h-2 rounded ${
                        strength < 50 ? "bg-red-500" : strength < 80 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${strength}%` }}
                ></div>
            </div>
            <p className="mt-2 text-sm font-bold">{strengthLabel}</p>
            <ul className="mt-2 text-sm">
                <li className={requirements.minLength ? "text-green-500" : "text-gray-500"}>
                    Minimum 8 characters
                </li>
                <li className={requirements.lowercase ? "text-green-500" : "text-gray-500"}>
                    At least one lowercase letter
                </li>
                <li className={requirements.uppercase ? "text-green-500" : "text-gray-500"}>
                    At least one uppercase letter
                </li>
                <li className={requirements.digit ? "text-green-500" : "text-gray-500"}>
                    At least one digit
                </li>
                <li className={requirements.special ? "text-green-500" : "text-gray-500"}>
                    At least one special character
                </li>
            </ul>
        </div>
    );
}
