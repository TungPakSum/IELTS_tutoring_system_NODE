markdown
複製
# IELTS Tutoring System Backend

## Introduction

Welcome to the IELTS Tutoring System Backend! This is a Node.js-based backend service designed to manage and facilitate IELTS tutoring sessions. The backend uses ChatAPI for all chat-related functionalities, providing a seamless communication experience between tutors and students.

## Features

- **User Authentication**: Secure login and registration for tutors and students.
- **Chat Functionality**: Real-time messaging between tutors and students using ChatAPI.
- **Progress Tracking**: Monitor student progress and performance over time.


## Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)
- MongoDB (v4.x or later)

## Installation

1. **Clone the Repository**:
    ```sh
    git clone https://github.com/TungPakSum/IELTS_tutoring_system_NODE.git
    ```

2. **Install Dependencies**:
    ```sh
    npm install
    ```

3. **Environment Variables**: Create a `.env` file in the root directory and add the following variables:
    ```env
    PORT=3000
    MONGO_URI= mongodb+srv://20230087:TungPakSum87@fyp.mjak5tb.mongodb.net/
    ```

4. **Start the Server**:
    ```sh
    npm start
    ```

## API Endpoints

### Authentication

- **Login**: `POST /api/users/login`
- **Register**: `POST /api/users/reg`

### Users

- **Get Profile**: `GET /api/users/:id`
- **Update Profile**: `PUT /api/users/update/:id`

### Store writing session chats

- **Save message**: `POST /api/chats/save`
- **Get messages**: `GET /api/chats/get/:uid`
- **Delete messages**: `DELETE /api/chats/delete/:uid`

### Store speaking session chats

- **Save message**: `POST /api/speakingChats/save`
- **Get messages**: `GET /api/speakingChats/get/:uid`
- **Delete messages**: `DELETE /api/speakingChats/delete/:uid`



Thank you for using the IELTS Tutoring System Backend. We hope it helps you manage your tutoring sessions effectively!
