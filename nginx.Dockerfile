# Use the official Nginx base image
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/ssl

# Copy certificates into the container
COPY /certificates/ca.crt /etc/nginx/ssl/
COPY /certificates/server.key /etc/nginx/ssl/
COPY /certificates/server.crt /etc/nginx/ssl/


# Set correct permissions
RUN chmod 600 /etc/nginx/ssl/server.key && chmod 644 /etc/nginx/ssl/ca.crt && chmod 644 /etc/nginx/ssl/server.crt

# Expose port 80
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
