# Employee Management System API

This API provides functionalities for managing user accounts, leaves, check-ins/check-outs, and timesheets in a company's leave management system.

## Signup

- **Method**: POST
- **Route**: `/api/v1/auth/signup`
- **Request Body**:
  ```json
  {
    "firstName": "user",
    "lastName": "1",
    "email": "u1@gmail.com",
    "password": "123456",
    "confirmPassword": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "newUser": {
        "firstName": "user",
        "lastName": "1",
        "email": "u1@gmail.com",
        "password": "hashedPassword",
        "id": 5,
        "leavesTaken": 0,
        "totalLeavesPerMonth": 5,
        "createdAt": "2024-02-26T08:52:49.994Z",
        "updatedAt": "2024-02-26T08:52:49.994Z"
    },
    "message": "User registered successfully"
  }
  ```

## Login

- **Method**: POST
- **Route**: `/api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "u1@gmail.com",
    "password": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "JWT_token",
    "user": {
        "id": 5,
        "firstName": "user",
        "lastName": "1",
        "email": "u1@gmail.com",
        "leavesTaken": 0,
        "totalLeavesPerMonth": 5,
        "createdAt": "2024-02-26T08:52:49.994Z",
        "updatedAt": "2024-02-26T08:52:49.994Z"
    },
    "message": "User login successfully"
  }
  ```

## CheckIn/CheckOut

- **Method**: POST
- **Route**: `/api/v1/auth/checkIn` and `/api/v1/auth/checkOut`
- **Response**: 
  ```json
  {
    "message": "checkedIn successfully"
  }
  ```
  and
  ```json
  {
    "success": true,
    "message": "User checked out successfully"
  }
  ```

## Apply Leave

- **Method**: POST
- **Route**: `/api/v1/auth/applyLeave`
- **Request Body**:
  ```json
  {
    "startDate": "2024-02-25T08:00:00Z",
    "endDate": "2024-02-25T17:00:00Z",
    "reason": "Family vacation"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Leave added successfully!",
    "data": {
        "user": {
            "email": "u1@gmail.com",
            "id": 5
        },
        "startDate": "2024-02-25T08:00:00.000Z",
        "endDate": "2024-02-25T17:00:00.000Z",
        "reason": "Family vacation",
        "status": "pending",
        "createdAt": "2024-02-26T08:39:55.744Z",
        "updatedAt": "2024-02-26T08:39:55.744Z"
    }
  }
  ```

## All Leaves

- **Method**: GET
- **Admin Route**: `/api/v1/auth/allLeave`
- **Response**: 
  If the user is not admin:
  ```json
  {
    "success": false,
    "message": "This is a protected route for Admin only"
  }
  ```
  If the user is admin:
  ```json
  {
    "allLeaves": [
        {
            "id": 1,
            "reason": "Family vacation",
            "startDate": "2024-02-25T08:00:00.000Z",
            "endDate": "2024-02-25T17:00:00.000Z",
            "status": "rejected",
            "createdAt": "2024-02-26T06:04:10.425Z",
            "updatedAt": "2024-02-26T06:10:16.388Z",
            "user": {
                "id": 2,
                "firstName": "G",
                "lastName": "S",
                "email": "user1@gmail.com",
                "leavesTaken": -3,
                "totalLeavesPerMonth": 5,
                "createdAt": "2024-02-26T06:03:54.283Z",
                "updatedAt": "2024-02-26T06:09:58.593Z"
            }
        }
    ]
  }
  ```

## Approve and Reject Leave

- **Method**: POST
- **Admin Route**: `/api/v1/auth/approve-leave/:leaveId` and `/api/v1/auth/reject-leave/:leaveId`
- **Response**:
  ```json
  {
    "message": "Leave approved successfully."
  }
  ```
  and
  ```json
  {
    "message": "Leave Rejected successfully."
  }
  ```

## Timesheet

- **Method**: POST
- **Admin Route**: `/api/v1/auth/user-timesheet`
- **Response**:
  ```json
  {
    "name": "user 1",
    "email": "u1@gmail.com",
    "timesheetArray": [
        {
            "checkIn": "Mon Feb 26 2024 11:45:45 GMT+0530 (India Standard Time)",
            "checkout": "Mon Feb 26 2024 11:45:50 GMT+0530 (India Standard Time)",
            "status": "present",
            "workingHours": "0.00",
            "leaveReason": "NULL"
        }
    ]
  }
  ```

## Prerequisites
- Node.js
- Express.js
- MongoDB

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run the server: `npm start`
