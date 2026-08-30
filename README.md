# Smart Student Hub

Project Type: Mobile App

App Name: Smart Student Portal

Description & Key Features: A comprehensive mobile application designed for university students to manage academics, attendance, fees, and tasks. The design must be clean, professional, and intuitive, using a color palette of Navy Blue (#1E3A8A), Sky Blue (#3B82F6), Teal (#14B8A6), and Crisp White (#FFFFFF).



Screen-by-Screen Requirements:



1. Splash & Onboarding: A simple welcome screen with the app logo and a "Get Started" button leading to Login/Signup.



2. Authentication (Login & Signup):

   - Login Screen: Fields for Email and Password, a "Forgot Password?" link, and a "Login" button. Include a "Don't have an account? Sign Up" link.

   - Signup Screen: A multi-input form capturing: Full Name, Student ID, Email, Branch, Year, and Semester, followed by a "Create Account" button.



3. Dashboard (Home Screen) - CRITICAL LAYOUT REQUIREMENT:

   - Header: App title "Smart Student Portal" and a profile icon.

   - Main Section: A prominent, central circular progress ring showing the overall "Total Attendance Percentage" (e.g., 85% with the number inside the circle).

   - Interactive Tabs: Immediately beside the circular progress ring, place four distinct, interactive, rounded-corner navigation cards/tabs:

     * "Mark Today's Attendance" (with calendar/checkmark icon).

     * "My Timetable" (with schedule icon).

     * "Fee Management" (with rupee/receipt icon).

     * "Assignments & Journals" (with task list icon).

   - Quick Access Section: Below the main cluster, include two smaller summary cards: "Today's Classes" and "Upcoming Deadlines".

   - Navigation: A persistent bottom navigation bar with icons for: Home, Attendance, Fees, and Profile.



4. Attendance Center (The Workflow):

   - Subject Feeder: A list view screen where subjects can be added/managed (+ button).

   - Timetable Grid: A clean, weekly grid view (Mon-Sat) where specific subjects are assigned to daily slots.

   - Daily Attendance Marker: A simplified list view of today's subjects, where each class has four actionable buttons/toggles for: Present, Absent, Off, Clear.



5. Fee Manager: An 8-semester structured view. Each semester is a card displaying Total Fees, Amount Paid, Status (Paid/Pending), and a prominent "Upload Receipt" button (icon for PDF/Image). It calculates and displays the overall total fees paid.



6. Tasks & Reminders: A screen with two tabs:

   - Active Tasks: A scrollable list of Assignments/Journals showing Subject, Deadline, and a "Mark as Done" checkbox. Include a visual warning (e.g., red bell) for tasks due soon.

   - Completed History: A tab listing finished tasks.



7. Profile Settings: A screen displaying user details (from Signup), app preferences, and a prominent Logout button.



This project was built with [Lovable](https://lovable.dev).

**Live app**: https://smartstudentportal.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/501bc108-ed9c-4564-b069-28f2bad55708).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
