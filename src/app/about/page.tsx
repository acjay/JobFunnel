export default function About() {
  return (
    <div>
      <h1>JobFunnel</h1>
      <p>
        Welcome to JobFunnel, a tool to help you track your job search. This is
        a work in progress, but the goal is to help you organize your job search
        process, from finding opportunities to tracking your applications.
      </p>
      <p>
        This tool is built on top of Notion, so you'll need a Notion account to
        use it. You can sign up for a free account at{" "}
        <a href="https://www.notion.so">notion.so</a>.
      </p>
      <p>
        Once you have a Notion account, you'll need to create a new page to use
        as your job funnel. You can create a new page by clicking the "New"
        button in the top left corner of the Notion app, then selecting "Page".
        Give your new page a name, then click "Create".
      </p>
      <p>
        Once you have a page, you'll need to find the page ID. You can find the
        page ID by clicking the "Share" button in the top right corner of the
        Notion app, then copying the link. The page ID is the part of the link
        that comes after the last slash. For example, if the link is
        "https://www.notion.so/My-Page-1234567890abcdef1234567890abcdef", the
        page ID is "1234567890abcdef1234567890abcdef".
      </p>
      <p>
        You'll also need to find your Notion API token. You can find your token
        by following the instructions at{" "}
        <a href="https://developers.notion.com/docs/getting-started">
          Notion's developer site
        </a>
        .
      </p>
      <p>
        Once you have your page ID and token, you can enter them in the fields
        above and click "Connect". This will connect your Notion account to
        JobFunnel, allowing you to use it to track your job search.
      </p>
      <p>
        If you have any questions or feedback, please feel free to reach out to
        me at <a href="mailto:alanjay1@gmail.com">alanjay1@gmail.com</a>.
      </p>
    </div>
  );
}
