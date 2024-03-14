import React from "react";

const PrivacyPolicy = () => {
  return (
    <div>
      <h1>Privacy Policy</h1>
      <p>
        At JobFunnel, we take your privacy seriously. We want to be transparent
        about how we handle your data.
      </p>
      <p>
        All data you provide to JobFunnel is stored securely in your own Notion
        instance. JobFunnel does not retain any of your data.
      </p>
      <p>
        We only store your email address to represent your identity and the
        tokens that allow us to present your Notion data to you through our
        website.
      </p>
      <p>
        Please note that JobFunnel uses Auth0 for login. Auth0 securely stores
        the login credentials of your choice.
      </p>
      <p>
        If you have any questions or concerns about our privacy policy, please{" "}
        <a href="https://acjay.com/contact/">contact us</a>.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
