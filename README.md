# RateLine

_This project was originally created as an internal tool used at [TimeLine Consulting Wuppertal GmbH](https://www.timeline-erp.com/)._

## Intro

RateLine is a web-based survey tool designed to help businesses evaluate online meetings by collecting feedback from customers. It enables internal users to create, manage, and analyze surveys, while allowing customers to provide anonymous ratings through a simple, accessible interface. With features like reusable survey templates, customizable surveys, and detailed evaluation reports, RateLine streamlines the process of gathering and analyzing feedback to improve meeting quality.

## Features

RateLine offers a comprehensive set of features to support survey management and feedback collection:

- **Secure Login**: Internal users can sign in with email and password, with support for password recovery.
- **Dashboard**: A central hub displays all surveys, with options to filter by status, date, or assigned employee, and search by name.
- **Survey Templates**: Create and manage reusable templates by selecting or creating questions, with editing and deletion restricted for templates used in active surveys.
- **Survey Management**: Build surveys from templates, customize questions, assign employees, and generate unique links or QR codes for sharing, with restrictions on editing or deleting active or closed surveys.
- **Question Management**: Maintain a repository of reusable questions, each answered with a 1–4 rating (1 = poor, 4 = excellent), with editing or deletion restricted for questions in use.
- **Public Survey Interface**: Customers can anonymously respond to surveys via a link or QR code, with a mobile-friendly interface that prevents multiple submissions.
- **Evaluation Reports**: Analyze feedback with overall metrics (e.g., average ratings, trends) and detailed per-survey results (e.g., rating distributions, employee-specific ratings), presented with visual charts.
- **Security**: Ensures data integrity with restrictions on actions (e.g., no edits to active surveys) and anonymity for customer responses.

## Security

TODO

## Technologies

This project is built with:

- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [shadcn-ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)

## Developer Notes

This section is specifically for developers with the intention of customizing this tool.

### Installation

#### Requirements

The only requirement is having [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/) and [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started/) installed.

#### Configuration

...TODO

#### Setup

...TODO

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/coderaveHQ/rateline_web_app

# Step 2: Navigate to the project directory.
cd rateline_web_app

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

You can now start building new features. HAPPY CODING!