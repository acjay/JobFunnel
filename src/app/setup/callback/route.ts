import { NextRequest, NextResponse } from "next/server";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { linkToNotion } from "../actions";

export const GET = withApiAuthRequired(async function GET(req: NextRequest) {
  const res = new NextResponse();
  const user = (await getSession(req, res))!.user;

  const { searchParams } = new URL(req.url);

  const error = searchParams.get("error");
  if (error) {
    // Errors may be found https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
    console.error("Error from Notion OAuth", error);
    return Response.redirect("/setup?connectSuccess=false");
  }

  const code = searchParams.get("code");
  if (!code) {
    return Response.json({ error: "No code provided" });
  }

  switch (await linkToNotion(user.sub, code)) {
    case "notion-token-exchange-failed":
      return Response.redirect("/setup?connectSuccess=false");
    case "linked-without-databases":
      return Response.redirect("/setup?connectSuccess=true");
    case "linked-with-databases":
      return Response.redirect("/?connectSuccess=true");
  }
});
