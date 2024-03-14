import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from "@nextui-org/react";

export default function SetupBody({
  headerContents,
  bodyContents,
  footerContents,
}: {
  headerContents: React.ReactNode;
  bodyContents: React.ReactNode;
  footerContents: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Card>
        <CardHeader className="prose">
          <h1>{headerContents}</h1>
        </CardHeader>
        <Divider />
        <CardBody className="prose">{bodyContents}</CardBody>
        <Divider />
        <CardFooter className="flex space-x-3 prose text-center">
          {footerContents}
        </CardFooter>
      </Card>
    </div>
  );
}
