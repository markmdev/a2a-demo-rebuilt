import type { Metadata } from "next";
import { CopilotKit } from "@copilotkit/react-core";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";

export const metadata: Metadata = {
  title: "A2A Demo - Agent Communication",
  description: "Demonstration of Agent-to-Agent communication using AG-UI Protocol and CopilotKit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="orchestrator"
          // agent="world_agent"
          threadId="user_1"
          showDevConsole={true}
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
