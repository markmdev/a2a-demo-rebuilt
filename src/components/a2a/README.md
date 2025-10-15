# A2A Message Visualization Components

Beautiful React components for visualizing Agent-to-Agent (A2A) communication in the chat interface.

## Components

### MessageToA2A
Shows outgoing messages from the orchestrator to A2A agents with a green-themed glass-morphism design.

**Features:**
- Green/emerald gradient glass card
- Agent badges with icons and framework labels
- Animated loading state while waiting for response
- Truncated task descriptions with tooltip
- Smooth fade-in animations

**Props:**
```typescript
{
  args: {
    agentName?: string;      // Name of the target agent
    task?: string;           // Task description to send
    [key: string]: any;      // Additional arguments
  };
  status?: "executing" | "complete" | "failed";
  result?: any;              // Not used in this component
}
```

### MessageFromA2A
Shows incoming responses from A2A agents to the orchestrator with a blue/indigo-themed glass-morphism design.

**Features:**
- Blue/indigo gradient glass card (matches app theme)
- Agent badges with icons and framework labels
- Success checkmark indicator
- Optional result data preview (collapsible)
- Smooth fade-in animations

**Props:**
```typescript
{
  args: {
    agentName?: string;      // Name of the source agent
    task?: string;           // Not typically used
    [key: string]: any;      // Additional arguments
  };
  status?: "executing" | "complete" | "failed";
  result?: any;              // Response data to display
}
```

## Usage

### Basic Import
```tsx
import { MessageToA2A, MessageFromA2A } from '@/components/a2a';
```

### CopilotKit Integration

Use these components as custom renderers for CopilotKit actions:

```tsx
import { useCopilotAction } from "@copilotkit/react-core";
import { MessageToA2A, MessageFromA2A } from '@/components/a2a';

function MyChat() {
  // Register an action that sends messages to A2A agents
  useCopilotAction({
    name: "send_message_to_a2a_agent",
    description: "Send a task to a specialized A2A agent",
    parameters: [
      {
        name: "agentName",
        type: "string",
        description: "The name of the A2A agent to send the message to",
        required: true,
      },
      {
        name: "task",
        type: "string",
        description: "The task or message to send to the agent",
        required: true,
      },
    ],
    handler: async ({ agentName, task }) => {
      // Call your A2A agent via API
      const response = await fetch("/api/a2a/send", {
        method: "POST",
        body: JSON.stringify({ agentName, task }),
      });
      return await response.json();
    },
    // Custom renderer for the action
    render: (props) => {
      // Show MessageToA2A while executing
      if (props.status === "executing") {
        return <MessageToA2A {...props} />;
      }
      // Show MessageFromA2A when complete
      if (props.status === "complete") {
        return (
          <>
            <MessageToA2A {...props} />
            <MessageFromA2A {...props} />
          </>
        );
      }
      return null;
    },
  });

  return <CopilotChat />;
}
```

### Standalone Usage
You can also use these components directly outside of CopilotKit:

```tsx
import { MessageToA2A, MessageFromA2A } from '@/components/a2a';

function AgentCommunicationLog() {
  return (
    <div>
      {/* Outgoing message */}
      <MessageToA2A
        args={{
          agentName: "Budget Agent",
          task: "Calculate budget for 5-day trip to Paris for 2 people",
        }}
        status="executing"
      />

      {/* Incoming response */}
      <MessageFromA2A
        args={{
          agentName: "Budget Agent",
        }}
        status="complete"
        result={{
          totalBudget: 5000,
          currency: "USD",
          breakdown: [
            { category: "Accommodation", amount: 2000 },
            { category: "Food", amount: 1500 },
            { category: "Transportation", amount: 1000 },
            { category: "Activities", amount: 500 },
          ],
        }}
      />
    </div>
  );
}
```

## Styling Utilities

### getAgentStyle
Get styling configuration for different agent types:

```tsx
import { getAgentStyle } from '@/components/a2a';

const style = getAgentStyle("Budget Agent");
// Returns: {
//   bgColor: "bg-gradient-to-r from-indigo-100 to-purple-100",
//   textColor: "text-indigo-800",
//   borderColor: "border-indigo-400",
//   icon: "✨",
//   framework: "ADK"
// }
```

**Agent Type Detection:**
- **ADK Agents** (✨ Indigo/Purple): budget, weather, activity, restaurant, itinerary, adk
- **Remote A2A Agents** (🔗 Green/Emerald): remote, external, a2a
- **Default** (🤖 Gray): unknown agents

### truncateTask
Helper to truncate long task descriptions:

```tsx
import { truncateTask } from '@/components/a2a';

const shortened = truncateTask("Very long task description...", 50);
// Returns: "Very long task description..." (truncated at 50 chars)
```

## Design System

### Colors
- **Outgoing (MessageToA2A)**: Emerald/Green theme
  - Background: `from-emerald-50/80 to-green-50/80`
  - Border: `border-emerald-200/50`
  - Arrow: Emerald with pulse animation

- **Incoming (MessageFromA2A)**: Blue/Indigo theme
  - Background: `from-blue-50/80 to-indigo-50/80`
  - Border: `border-blue-200/50`
  - Arrow: Blue

- **Agent Badges**: Dynamic based on agent type
  - ADK: Indigo/Purple gradient
  - Remote: Emerald/Green gradient
  - Orchestrator: Gray gradient

### Glass-morphism Effects
Both components use consistent glass-morphism styling:
- Semi-transparent backgrounds with gradient overlays
- `backdrop-blur-md` for frosted glass effect
- Subtle border with opacity
- Shadow effects on hover
- Smooth transitions

### Animations
- Fade-in on mount: `animate-in fade-in slide-in-from-bottom-2`
- Loading dots: Bouncing animation with staggered delays
- Arrow pulse: `animate-pulse` on executing state
- Hover effects: Scale and shadow transitions

## Accessibility

Both components include proper accessibility features:
- `role="status"` for screen readers
- `aria-live="polite"` for dynamic updates
- `aria-label` for descriptive context
- Semantic HTML structure
- Keyboard-accessible details/summary for result preview

## File Structure

```
src/components/a2a/
├── index.ts                 # Barrel exports
├── MessageToA2A.tsx         # Outgoing message component
├── MessageFromA2A.tsx       # Incoming response component
├── agent-styles.ts          # Styling utilities
└── README.md                # This file
```

## Examples

### Complete CopilotKit Setup

```tsx
"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
import { MessageToA2A, MessageFromA2A } from "@/components/a2a";

export default function ChatPage() {
  // Register A2A action
  useCopilotAction({
    name: "send_message_to_a2a_agent",
    description: "Send a task to an A2A agent",
    parameters: [
      {
        name: "agentName",
        type: "string",
        description: "Agent to contact (Budget Agent, Weather Agent, etc.)",
      },
      {
        name: "task",
        type: "string",
        description: "Task description",
      },
    ],
    handler: async ({ agentName, task }) => {
      // Your API call here
      const response = await callA2AAgent(agentName, task);
      return response;
    },
    render: (props) => (
      <>
        <MessageToA2A {...props} />
        {props.status === "complete" && <MessageFromA2A {...props} />}
      </>
    ),
  });

  return (
    <CopilotChat
      instructions="You can send tasks to specialized agents..."
    />
  );
}
```

## Contributing

When modifying these components, ensure:
1. TypeScript types are maintained
2. Accessibility features remain intact
3. Glass-morphism styling is consistent
4. Animations are smooth and performant
5. Documentation is updated
