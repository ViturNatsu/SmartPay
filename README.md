# SmartPay

SmartPay is a full-stack banking application that features OTP (one-time password), input validation and Spring Security. It uses React for the frontend, Spring Boot for the backend and MailHog for testing emails.

## Getting started

Make sure you have the following installed:

- [Git](https://git-scm.com/install/)
- [Java 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- [MailHog](https://github.com/mailhog/MailHog)
- [Node.js](https://nodejs.org/en/download)
- Code editor of your choice

## Cloning the repository

```
git clone https://git.fdmgroup.com/smartpay-pod/smartpay.git
cd smartpay
git checkout develop
```

## Running the application

First run MailHog:

### For macOS

- For MacOS: run `mailhog` in the command line

### For Windows

- For Windows: run `mailhog.exe` in the command line

Then you should be able to access the MailHog UI at http://localhost:8025/. (This is the default location of MailHog)

### Running the Backend

Start the backend by finding the class `SmartPayBackEndApplication.java` under `backend` > `src` > `main` > `java` > `com` > `fdmgroup` > `SmartPay_BackEnd` and running the `main()` method. This will differ depending on which code editor you are using.

### Running the Frontend

Start the frontend by navigating the current directory into `frontend` and run `npm install` to install frontend dependencies. Then run `npm run dev` to start the frontend. You should be able to now access the frontend at http://localhost:5173/.
