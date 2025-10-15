import type { Metadata } from "next";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import { ConversationProvider } from "@/lib/contexts/ConversationContext";
import DynamicCopilotWrapper from "@/components/DynamicCopilotWrapper";

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
        <ConversationProvider>
          <DynamicCopilotWrapper>
            {children}
          </DynamicCopilotWrapper>
        </ConversationProvider>
      </body>
    </html>
  );
}
