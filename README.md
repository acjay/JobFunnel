# JobFunnel

JobFunnel is a job search management tool, designed to address pain points I have experienced in conducting a wide ranging job search. I suspect that many people do not systems in place to help them to be as effective at job searching as they could be. I wanted to create the tool I want for myself, and also make it available for others.

_(Todo: create a demo database and insert screenshot)_

## Architecture

It is based on a workflow I am continuing to build out in [Notion](https://notion.so), and it uses Notion as its database, via the Notion API. This is so that I can continue to do my job search and iterate on the Notion-based workflow, while building out JobFunnel.

It requires 3 databases with a fixed schema: one for opportunities, one for tasks, and one for events. Eventually, I will add functionality to let this app bootstrap the Notion databases it requires, and perhaps I will make a version that can use alternative databases.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Credit

This project is by Alan Johnson. I may decide to build a product around this, and so the source is available, but the code is not to be used in commercial applications without permission. If you want a license to use part of this code with an open source license, [send me a message](https://acjay.com/contact/).
