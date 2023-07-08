import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Col, Row } from "antd";
import { AppWalletAddProvider } from "@/context/WalletContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppWalletAddProvider>
      <Row justify="center">
        <Col xxl={10}>
          <Component {...pageProps} />
        </Col>
      </Row>
    </AppWalletAddProvider>
  );
}
