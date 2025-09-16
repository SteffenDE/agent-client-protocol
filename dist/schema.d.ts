import { z } from 'zod';

declare const AGENT_METHODS: {
    authenticate: string;
    initialize: string;
    session_cancel: string;
    session_load: string;
    session_new: string;
    session_prompt: string;
};
declare const CLIENT_METHODS: {
    fs_read_text_file: string;
    fs_write_text_file: string;
    session_request_permission: string;
    session_update: string;
    terminal_create: string;
    terminal_output: string;
    terminal_release: string;
    terminal_wait_for_exit: string;
};
declare const PROTOCOL_VERSION = 1;

type AgentClientProtocol = ClientRequest | ClientResponse | ClientNotification | AgentRequest | AgentResponse | AgentNotification;
/**
 * All possible requests that an agent can send to a client.
 *
 * This enum is used internally for routing RPC requests. You typically won't need
 * to use this directly - instead, use the methods on the [`Client`] trait.
 *
 * This enum encompasses all method calls from agent to client.
 */
/** @internal */
type ClientRequest = WriteTextFileRequest | ReadTextFileRequest | RequestPermissionRequest | CreateTerminalRequest | TerminalOutputRequest | ReleaseTerminalRequest | WaitForTerminalExitRequest;
/**
 * Content produced by a tool call.
 *
 * Tool calls can produce different types of content including
 * standard content blocks (text, images) or file diffs.
 *
 * See protocol docs: [Content](https://agentclientprotocol.com/protocol/tool-calls#content)
 */
type ToolCallContent = {
    /**
     * Content blocks represent displayable information in the Agent Client Protocol.
     *
     * They provide a structured way to handle various types of user-facing content—whether
     * it's text from language models, images for analysis, or embedded resources for context.
     *
     * Content blocks appear in:
     * - User prompts sent via `session/prompt`
     * - Language model output streamed through `session/update` notifications
     * - Progress updates and results from tool calls
     *
     * This structure is compatible with the Model Context Protocol (MCP), enabling
     * agents to seamlessly forward content from MCP tool outputs without transformation.
     *
     * See protocol docs: [Content](https://agentclientprotocol.com/protocol/content)
     */
    content: {
        annotations?: Annotations | null;
        text: string;
        type: "text";
    } | {
        annotations?: Annotations | null;
        data: string;
        mimeType: string;
        type: "image";
        uri?: string | null;
    } | {
        annotations?: Annotations | null;
        data: string;
        mimeType: string;
        type: "audio";
    } | {
        annotations?: Annotations | null;
        description?: string | null;
        mimeType?: string | null;
        name: string;
        size?: number | null;
        title?: string | null;
        type: "resource_link";
        uri: string;
    } | {
        annotations?: Annotations | null;
        resource: EmbeddedResourceResource;
        type: "resource";
    };
    type: "content";
} | {
    /**
     * The new content after modification.
     */
    newText: string;
    /**
     * The original content (None for new files).
     */
    oldText?: string | null;
    /**
     * The file path being modified.
     */
    path: string;
    type: "diff";
} | {
    terminalId: string;
    type: "terminal";
};
/**
 * The sender or recipient of messages and data in a conversation.
 */
type Role = "assistant" | "user";
/**
 * Resource content that can be embedded in a message.
 */
type EmbeddedResourceResource = TextResourceContents | BlobResourceContents;
/**
 * Categories of tools that can be invoked.
 *
 * Tool kinds help clients choose appropriate icons and optimize how they
 * display tool execution progress.
 *
 * See protocol docs: [Creating](https://agentclientprotocol.com/protocol/tool-calls#creating)
 */
type ToolKind = "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other";
/**
 * Execution status of a tool call.
 *
 * Tool calls progress through different statuses during their lifecycle.
 *
 * See protocol docs: [Status](https://agentclientprotocol.com/protocol/tool-calls#status)
 */
type ToolCallStatus = "pending" | "in_progress" | "completed" | "failed";
/**
 * A unique identifier for a conversation session between a client and agent.
 *
 * Sessions maintain their own context, conversation history, and state,
 * allowing multiple independent interactions with the same agent.
 *
 * # Example
 *
 * ```
 * use agent_client_protocol::SessionId;
 * use std::sync::Arc;
 *
 * let session_id = SessionId(Arc::from("sess_abc123def456"));
 * ```
 *
 * See protocol docs: [Session ID](https://agentclientprotocol.com/protocol/session-setup#session-id)
 */
type SessionId = string;
/**
 * All possible responses that a client can send to an agent.
 *
 * This enum is used internally for routing RPC responses. You typically won't need
 * to use this directly - the responses are handled automatically by the connection.
 *
 * These are responses to the corresponding AgentRequest variants.
 */
/** @internal */
type ClientResponse = WriteTextFileResponse | ReadTextFileResponse | RequestPermissionResponse | CreateTerminalResponse | TerminalOutputResponse | ReleaseTerminalResponse | WaitForTerminalExitResponse;
type WriteTextFileResponse = null;
type ReleaseTerminalResponse = null;
/**
 * All possible notifications that a client can send to an agent.
 *
 * This enum is used internally for routing RPC notifications. You typically won't need
 * to use this directly - use the notification methods on the [`Agent`] trait instead.
 *
 * Notifications do not expect a response.
 */
/** @internal */
type ClientNotification = CancelNotification;
/**
 * All possible requests that a client can send to an agent.
 *
 * This enum is used internally for routing RPC requests. You typically won't need
 * to use this directly - instead, use the methods on the [`Agent`] trait.
 *
 * This enum encompasses all method calls from client to agent.
 */
/** @internal */
type AgentRequest = InitializeRequest | AuthenticateRequest | NewSessionRequest | LoadSessionRequest | PromptRequest;
/**
 * Content blocks represent displayable information in the Agent Client Protocol.
 *
 * They provide a structured way to handle various types of user-facing content—whether
 * it's text from language models, images for analysis, or embedded resources for context.
 *
 * Content blocks appear in:
 * - User prompts sent via `session/prompt`
 * - Language model output streamed through `session/update` notifications
 * - Progress updates and results from tool calls
 *
 * This structure is compatible with the Model Context Protocol (MCP), enabling
 * agents to seamlessly forward content from MCP tool outputs without transformation.
 *
 * See protocol docs: [Content](https://agentclientprotocol.com/protocol/content)
 */
type ContentBlock = {
    annotations?: Annotations | null;
    text: string;
    type: "text";
} | {
    annotations?: Annotations | null;
    data: string;
    mimeType: string;
    type: "image";
    uri?: string | null;
} | {
    annotations?: Annotations | null;
    data: string;
    mimeType: string;
    type: "audio";
} | {
    annotations?: Annotations | null;
    description?: string | null;
    mimeType?: string | null;
    name: string;
    size?: number | null;
    title?: string | null;
    type: "resource_link";
    uri: string;
} | {
    annotations?: Annotations | null;
    resource: EmbeddedResourceResource;
    type: "resource";
};
/**
 * All possible responses that an agent can send to a client.
 *
 * This enum is used internally for routing RPC responses. You typically won't need
 * to use this directly - the responses are handled automatically by the connection.
 *
 * These are responses to the corresponding ClientRequest variants.
 */
/** @internal */
type AgentResponse = InitializeResponse | AuthenticateResponse | NewSessionResponse | LoadSessionResponse | PromptResponse;
type AuthenticateResponse = null;
type LoadSessionResponse = null;
/**
 * All possible notifications that an agent can send to a client.
 *
 * This enum is used internally for routing RPC notifications. You typically won't need
 * to use this directly - use the notification methods on the [`Client`] trait instead.
 *
 * Notifications do not expect a response.
 */
/** @internal */
type AgentNotification = SessionNotification;
/**
 * Request to write content to a text file.
 *
 * Only available if the client supports the `fs.writeTextFile` capability.
 */
interface WriteTextFileRequest {
    /**
     * The text content to write to the file.
     */
    content: string;
    /**
     * Absolute path to the file to write.
     */
    path: string;
    /**
     * The session ID for this request.
     */
    sessionId: string;
}
/**
 * Request to read content from a text file.
 *
 * Only available if the client supports the `fs.readTextFile` capability.
 */
interface ReadTextFileRequest {
    /**
     * Optional maximum number of lines to read.
     */
    limit?: number | null;
    /**
     * Optional line number to start reading from (1-based).
     */
    line?: number | null;
    /**
     * Absolute path to the file to read.
     */
    path: string;
    /**
     * The session ID for this request.
     */
    sessionId: string;
}
/**
 * Request for user permission to execute a tool call.
 *
 * Sent when the agent needs authorization before performing a sensitive operation.
 *
 * See protocol docs: [Requesting Permission](https://agentclientprotocol.com/protocol/tool-calls#requesting-permission)
 */
interface RequestPermissionRequest {
    /**
     * Available permission options for the user to choose from.
     */
    options: PermissionOption[];
    /**
     * The session ID for this request.
     */
    sessionId: string;
    toolCall: ToolCallUpdate;
}
/**
 * An option presented to the user when requesting permission.
 */
interface PermissionOption {
    /**
     * Hint about the nature of this permission option.
     */
    kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
    /**
     * Human-readable label to display to the user.
     */
    name: string;
    /**
     * Unique identifier for this permission option.
     */
    optionId: string;
}
/**
 * Details about the tool call requiring permission.
 */
interface ToolCallUpdate {
    /**
     * Replace the content collection.
     */
    content?: ToolCallContent[] | null;
    /**
     * Update the tool kind.
     */
    kind?: ToolKind | null;
    /**
     * Replace the locations collection.
     */
    locations?: ToolCallLocation[] | null;
    /**
     * Update the raw input.
     */
    rawInput?: {
        [k: string]: unknown;
    };
    /**
     * Update the raw output.
     */
    rawOutput?: {
        [k: string]: unknown;
    };
    /**
     * Update the execution status.
     */
    status?: ToolCallStatus | null;
    /**
     * Update the human-readable title.
     */
    title?: string | null;
    /**
     * The ID of the tool call being updated.
     */
    toolCallId: string;
}
/**
 * Optional annotations for the client. The client can use annotations to inform how objects are used or displayed
 */
interface Annotations {
    audience?: Role[] | null;
    lastModified?: string | null;
    priority?: number | null;
}
/**
 * Text-based resource contents.
 */
interface TextResourceContents {
    mimeType?: string | null;
    text: string;
    uri: string;
}
/**
 * Binary resource contents.
 */
interface BlobResourceContents {
    blob: string;
    mimeType?: string | null;
    uri: string;
}
/**
 * A file location being accessed or modified by a tool.
 *
 * Enables clients to implement "follow-along" features that track
 * which files the agent is working with in real-time.
 *
 * See protocol docs: [Following the Agent](https://agentclientprotocol.com/protocol/tool-calls#following-the-agent)
 */
interface ToolCallLocation {
    /**
     * Optional line number within the file.
     */
    line?: number | null;
    /**
     * The file path being accessed or modified.
     */
    path: string;
}
interface CreateTerminalRequest {
    args?: string[];
    command: string;
    cwd?: string | null;
    env?: EnvVariable[];
    outputByteLimit?: number | null;
    sessionId: SessionId;
}
/**
 * An environment variable to set when launching an MCP server.
 */
interface EnvVariable {
    /**
     * The name of the environment variable.
     */
    name: string;
    /**
     * The value to set for the environment variable.
     */
    value: string;
}
interface TerminalOutputRequest {
    sessionId: SessionId;
    terminalId: string;
}
interface ReleaseTerminalRequest {
    sessionId: SessionId;
    terminalId: string;
}
interface WaitForTerminalExitRequest {
    sessionId: SessionId;
    terminalId: string;
}
/**
 * Response containing the contents of a text file.
 */
interface ReadTextFileResponse {
    content: string;
}
/**
 * Response to a permission request.
 */
interface RequestPermissionResponse {
    /**
     * The user's decision on the permission request.
     */
    outcome: {
        outcome: "cancelled";
    } | {
        /**
         * The ID of the option the user selected.
         */
        optionId: string;
        outcome: "selected";
    };
}
interface CreateTerminalResponse {
    terminalId: string;
}
interface TerminalOutputResponse {
    exitStatus?: TerminalExitStatus | null;
    output: string;
    truncated: boolean;
}
interface TerminalExitStatus {
    exitCode?: number | null;
    signal?: string | null;
}
interface WaitForTerminalExitResponse {
    exitCode?: number | null;
    signal?: string | null;
}
/**
 * Notification to cancel ongoing operations for a session.
 *
 * See protocol docs: [Cancellation](https://agentclientprotocol.com/protocol/prompt-turn#cancellation)
 */
interface CancelNotification {
    /**
     * A unique identifier for a conversation session between a client and agent.
     *
     * Sessions maintain their own context, conversation history, and state,
     * allowing multiple independent interactions with the same agent.
     *
     * # Example
     *
     * ```
     * use agent_client_protocol::SessionId;
     * use std::sync::Arc;
     *
     * let session_id = SessionId(Arc::from("sess_abc123def456"));
     * ```
     *
     * See protocol docs: [Session ID](https://agentclientprotocol.com/protocol/session-setup#session-id)
     */
    sessionId: string;
}
/**
 * Request parameters for the initialize method.
 *
 * Sent by the client to establish connection and negotiate capabilities.
 *
 * See protocol docs: [Initialization](https://agentclientprotocol.com/protocol/initialization)
 */
interface InitializeRequest {
    clientCapabilities?: ClientCapabilities;
    /**
     * The latest protocol version supported by the client.
     */
    protocolVersion: number;
}
/**
 * Capabilities supported by the client.
 */
interface ClientCapabilities {
    fs?: FileSystemCapability;
    /**
     * **UNSTABLE**
     *
     * This capability is not part of the spec yet, and may be removed or changed at any point.
     */
    terminal?: boolean;
}
/**
 * File system capabilities supported by the client.
 * Determines which file operations the agent can request.
 */
interface FileSystemCapability {
    /**
     * Whether the Client supports `fs/read_text_file` requests.
     */
    readTextFile?: boolean;
    /**
     * Whether the Client supports `fs/write_text_file` requests.
     */
    writeTextFile?: boolean;
}
/**
 * Request parameters for the authenticate method.
 *
 * Specifies which authentication method to use.
 */
interface AuthenticateRequest {
    /**
     * The ID of the authentication method to use.
     * Must be one of the methods advertised in the initialize response.
     */
    methodId: string;
}
/**
 * Request parameters for creating a new session.
 *
 * See protocol docs: [Creating a Session](https://agentclientprotocol.com/protocol/session-setup#creating-a-session)
 */
interface NewSessionRequest {
    /**
     * The working directory for this session. Must be an absolute path.
     */
    cwd: string;
    /**
     * List of MCP (Model Context Protocol) servers the agent should connect to.
     */
    mcpServers: McpServer[];
}
/**
 * Configuration for connecting to an MCP (Model Context Protocol) server.
 *
 * MCP servers provide tools and context that the agent can use when
 * processing prompts.
 *
 * See protocol docs: [MCP Servers](https://agentclientprotocol.com/protocol/session-setup#mcp-servers)
 */
interface McpServer {
    /**
     * Command-line arguments to pass to the MCP server.
     */
    args: string[];
    /**
     * Path to the MCP server executable.
     */
    command: string;
    /**
     * Environment variables to set when launching the MCP server.
     */
    env: EnvVariable[];
    /**
     * Human-readable name identifying this MCP server.
     */
    name: string;
}
/**
 * Request parameters for loading an existing session.
 *
 * Only available if the agent supports the `loadSession` capability.
 *
 * See protocol docs: [Loading Sessions](https://agentclientprotocol.com/protocol/session-setup#loading-sessions)
 */
interface LoadSessionRequest {
    /**
     * The working directory for this session.
     */
    cwd: string;
    /**
     * List of MCP servers to connect to for this session.
     */
    mcpServers: McpServer[];
    /**
     * A unique identifier for a conversation session between a client and agent.
     *
     * Sessions maintain their own context, conversation history, and state,
     * allowing multiple independent interactions with the same agent.
     *
     * # Example
     *
     * ```
     * use agent_client_protocol::SessionId;
     * use std::sync::Arc;
     *
     * let session_id = SessionId(Arc::from("sess_abc123def456"));
     * ```
     *
     * See protocol docs: [Session ID](https://agentclientprotocol.com/protocol/session-setup#session-id)
     */
    sessionId: string;
}
/**
 * Request parameters for sending a user prompt to the agent.
 *
 * Contains the user's message and any additional context.
 *
 * See protocol docs: [User Message](https://agentclientprotocol.com/protocol/prompt-turn#1-user-message)
 */
interface PromptRequest {
    /**
     * The blocks of content that compose the user's message.
     *
     * As a baseline, the Agent MUST support [`ContentBlock::Text`] and [`ContentBlock::ResourceLink`],
     * while other variants are optionally enabled via [`PromptCapabilities`].
     *
     * The Client MUST adapt its interface according to [`PromptCapabilities`].
     *
     * The client MAY include referenced pieces of context as either
     * [`ContentBlock::Resource`] or [`ContentBlock::ResourceLink`].
     *
     * When available, [`ContentBlock::Resource`] is preferred
     * as it avoids extra round-trips and allows the message to include
     * pieces of context from sources the agent may not have access to.
     */
    prompt: ContentBlock[];
    /**
     * A unique identifier for a conversation session between a client and agent.
     *
     * Sessions maintain their own context, conversation history, and state,
     * allowing multiple independent interactions with the same agent.
     *
     * # Example
     *
     * ```
     * use agent_client_protocol::SessionId;
     * use std::sync::Arc;
     *
     * let session_id = SessionId(Arc::from("sess_abc123def456"));
     * ```
     *
     * See protocol docs: [Session ID](https://agentclientprotocol.com/protocol/session-setup#session-id)
     */
    sessionId: string;
}
/**
 * Response from the initialize method.
 *
 * Contains the negotiated protocol version and agent capabilities.
 *
 * See protocol docs: [Initialization](https://agentclientprotocol.com/protocol/initialization)
 */
interface InitializeResponse {
    agentCapabilities?: AgentCapabilities;
    /**
     * Authentication methods supported by the agent.
     */
    authMethods?: AuthMethod[];
    /**
     * The protocol version the client specified if supported by the agent,
     * or the latest protocol version supported by the agent.
     *
     * The client should disconnect, if it doesn't support this version.
     */
    protocolVersion: number;
}
/**
 * Capabilities supported by the agent.
 */
interface AgentCapabilities {
    /**
     * Whether the agent supports `session/load`.
     */
    loadSession?: boolean;
    promptCapabilities?: PromptCapabilities;
}
/**
 * Prompt capabilities supported by the agent.
 */
interface PromptCapabilities {
    /**
     * Agent supports [`ContentBlock::Audio`].
     */
    audio?: boolean;
    /**
     * Agent supports embedded context in `session/prompt` requests.
     *
     * When enabled, the Client is allowed to include [`ContentBlock::Resource`]
     * in prompt requests for pieces of context that are referenced in the message.
     */
    embeddedContext?: boolean;
    /**
     * Agent supports [`ContentBlock::Image`].
     */
    image?: boolean;
}
/**
 * Describes an available authentication method.
 */
interface AuthMethod {
    /**
     * Optional description providing more details about this authentication method.
     */
    description?: string | null;
    /**
     * Unique identifier for this authentication method.
     */
    id: string;
    /**
     * Human-readable name of the authentication method.
     */
    name: string;
}
/**
 * Response from creating a new session.
 *
 * See protocol docs: [Creating a Session](https://agentclientprotocol.com/protocol/session-setup#creating-a-session)
 */
interface NewSessionResponse {
    /**
     * A unique identifier for a conversation session between a client and agent.
     *
     * Sessions maintain their own context, conversation history, and state,
     * allowing multiple independent interactions with the same agent.
     *
     * # Example
     *
     * ```
     * use agent_client_protocol::SessionId;
     * use std::sync::Arc;
     *
     * let session_id = SessionId(Arc::from("sess_abc123def456"));
     * ```
     *
     * See protocol docs: [Session ID](https://agentclientprotocol.com/protocol/session-setup#session-id)
     */
    sessionId: string;
}
/**
 * Response from processing a user prompt.
 *
 * See protocol docs: [Check for Completion](https://agentclientprotocol.com/protocol/prompt-turn#4-check-for-completion)
 */
interface PromptResponse {
    /**
     * Indicates why the agent stopped processing the turn.
     */
    stopReason: "end_turn" | "max_tokens" | "max_turn_requests" | "refusal" | "cancelled";
}
/**
 * Notification containing a session update from the agent.
 *
 * Used to stream real-time progress and results during prompt processing.
 *
 * See protocol docs: [Agent Reports Output](https://agentclientprotocol.com/protocol/prompt-turn#3-agent-reports-output)
 */
interface SessionNotification {
    /**
     * The ID of the session this update pertains to.
     */
    sessionId: string;
    /**
     * The actual update content.
     */
    update: {
        content: ContentBlock;
        sessionUpdate: "user_message_chunk";
    } | {
        content: ContentBlock;
        sessionUpdate: "agent_message_chunk";
    } | {
        content: ContentBlock;
        sessionUpdate: "agent_thought_chunk";
    } | {
        /**
         * Content produced by the tool call.
         */
        content?: ToolCallContent[];
        /**
         * The category of tool being invoked.
         * Helps clients choose appropriate icons and UI treatment.
         */
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other";
        /**
         * File locations affected by this tool call.
         * Enables "follow-along" features in clients.
         */
        locations?: ToolCallLocation[];
        /**
         * Raw input parameters sent to the tool.
         */
        rawInput?: {
            [k: string]: unknown;
        };
        /**
         * Raw output returned by the tool.
         */
        rawOutput?: {
            [k: string]: unknown;
        };
        sessionUpdate: "tool_call";
        /**
         * Current execution status of the tool call.
         */
        status?: "pending" | "in_progress" | "completed" | "failed";
        /**
         * Human-readable title describing what the tool is doing.
         */
        title: string;
        /**
         * Unique identifier for this tool call within the session.
         */
        toolCallId: string;
    } | {
        /**
         * Replace the content collection.
         */
        content?: ToolCallContent[] | null;
        /**
         * Update the tool kind.
         */
        kind?: ToolKind | null;
        /**
         * Replace the locations collection.
         */
        locations?: ToolCallLocation[] | null;
        /**
         * Update the raw input.
         */
        rawInput?: {
            [k: string]: unknown;
        };
        /**
         * Update the raw output.
         */
        rawOutput?: {
            [k: string]: unknown;
        };
        sessionUpdate: "tool_call_update";
        /**
         * Update the execution status.
         */
        status?: ToolCallStatus | null;
        /**
         * Update the human-readable title.
         */
        title?: string | null;
        /**
         * The ID of the tool call being updated.
         */
        toolCallId: string;
    } | {
        /**
         * The list of tasks to be accomplished.
         *
         * When updating a plan, the agent must send a complete list of all entries
         * with their current status. The client replaces the entire plan with each update.
         */
        entries: PlanEntry[];
        sessionUpdate: "plan";
    };
}
/**
 * A single entry in the execution plan.
 *
 * Represents a task or goal that the assistant intends to accomplish
 * as part of fulfilling the user's request.
 * See protocol docs: [Plan Entries](https://agentclientprotocol.com/protocol/agent-plan#plan-entries)
 */
interface PlanEntry {
    /**
     * Human-readable description of what this task aims to accomplish.
     */
    content: string;
    /**
     * The relative importance of this task.
     * Used to indicate which tasks are most critical to the overall goal.
     */
    priority: "high" | "medium" | "low";
    /**
     * Current execution status of this task.
     */
    status: "pending" | "in_progress" | "completed";
}
/** @internal */
declare const writeTextFileRequestSchema: z.ZodObject<{
    content: z.ZodString;
    path: z.ZodString;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    sessionId: string;
    content: string;
}, {
    path: string;
    sessionId: string;
    content: string;
}>;
/** @internal */
declare const readTextFileRequestSchema: z.ZodObject<{
    limit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    path: z.ZodString;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    sessionId: string;
    limit?: number | null | undefined;
    line?: number | null | undefined;
}, {
    path: string;
    sessionId: string;
    limit?: number | null | undefined;
    line?: number | null | undefined;
}>;
/** @internal */
declare const roleSchema: z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>;
/** @internal */
declare const textResourceContentsSchema: z.ZodObject<{
    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    text: z.ZodString;
    uri: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    uri: string;
    mimeType?: string | null | undefined;
}, {
    text: string;
    uri: string;
    mimeType?: string | null | undefined;
}>;
/** @internal */
declare const blobResourceContentsSchema: z.ZodObject<{
    blob: z.ZodString;
    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    uri: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uri: string;
    blob: string;
    mimeType?: string | null | undefined;
}, {
    uri: string;
    blob: string;
    mimeType?: string | null | undefined;
}>;
/** @internal */
declare const toolKindSchema: z.ZodUnion<[z.ZodLiteral<"read">, z.ZodLiteral<"edit">, z.ZodLiteral<"delete">, z.ZodLiteral<"move">, z.ZodLiteral<"search">, z.ZodLiteral<"execute">, z.ZodLiteral<"think">, z.ZodLiteral<"fetch">, z.ZodLiteral<"other">]>;
/** @internal */
declare const toolCallStatusSchema: z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">, z.ZodLiteral<"failed">]>;
/** @internal */
declare const sessionIdSchema: z.ZodString;
/** @internal */
declare const writeTextFileResponseSchema: z.ZodNull;
/** @internal */
declare const readTextFileResponseSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
/** @internal */
declare const requestPermissionResponseSchema: z.ZodObject<{
    outcome: z.ZodUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"cancelled">;
    }, "strip", z.ZodTypeAny, {
        outcome: "cancelled";
    }, {
        outcome: "cancelled";
    }>, z.ZodObject<{
        optionId: z.ZodString;
        outcome: z.ZodLiteral<"selected">;
    }, "strip", z.ZodTypeAny, {
        optionId: string;
        outcome: "selected";
    }, {
        optionId: string;
        outcome: "selected";
    }>]>;
}, "strip", z.ZodTypeAny, {
    outcome: {
        outcome: "cancelled";
    } | {
        optionId: string;
        outcome: "selected";
    };
}, {
    outcome: {
        outcome: "cancelled";
    } | {
        optionId: string;
        outcome: "selected";
    };
}>;
/** @internal */
declare const createTerminalResponseSchema: z.ZodObject<{
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    terminalId: string;
}, {
    terminalId: string;
}>;
/** @internal */
declare const releaseTerminalResponseSchema: z.ZodNull;
/** @internal */
declare const waitForTerminalExitResponseSchema: z.ZodObject<{
    exitCode: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    signal: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    exitCode?: number | null | undefined;
    signal?: string | null | undefined;
}, {
    exitCode?: number | null | undefined;
    signal?: string | null | undefined;
}>;
/** @internal */
declare const cancelNotificationSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
/** @internal */
declare const authenticateRequestSchema: z.ZodObject<{
    methodId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    methodId: string;
}, {
    methodId: string;
}>;
/** @internal */
declare const annotationsSchema: z.ZodObject<{
    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    audience?: ("assistant" | "user")[] | null | undefined;
    lastModified?: string | null | undefined;
    priority?: number | null | undefined;
}, {
    audience?: ("assistant" | "user")[] | null | undefined;
    lastModified?: string | null | undefined;
    priority?: number | null | undefined;
}>;
/** @internal */
declare const embeddedResourceResourceSchema: z.ZodUnion<[z.ZodObject<{
    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    text: z.ZodString;
    uri: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    uri: string;
    mimeType?: string | null | undefined;
}, {
    text: string;
    uri: string;
    mimeType?: string | null | undefined;
}>, z.ZodObject<{
    blob: z.ZodString;
    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    uri: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uri: string;
    blob: string;
    mimeType?: string | null | undefined;
}, {
    uri: string;
    blob: string;
    mimeType?: string | null | undefined;
}>]>;
/** @internal */
declare const authenticateResponseSchema: z.ZodNull;
/** @internal */
declare const newSessionResponseSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
/** @internal */
declare const loadSessionResponseSchema: z.ZodNull;
/** @internal */
declare const promptResponseSchema: z.ZodObject<{
    stopReason: z.ZodUnion<[z.ZodLiteral<"end_turn">, z.ZodLiteral<"max_tokens">, z.ZodLiteral<"max_turn_requests">, z.ZodLiteral<"refusal">, z.ZodLiteral<"cancelled">]>;
}, "strip", z.ZodTypeAny, {
    stopReason: "cancelled" | "end_turn" | "max_tokens" | "max_turn_requests" | "refusal";
}, {
    stopReason: "cancelled" | "end_turn" | "max_tokens" | "max_turn_requests" | "refusal";
}>;
/** @internal */
declare const permissionOptionSchema: z.ZodObject<{
    kind: z.ZodUnion<[z.ZodLiteral<"allow_once">, z.ZodLiteral<"allow_always">, z.ZodLiteral<"reject_once">, z.ZodLiteral<"reject_always">]>;
    name: z.ZodString;
    optionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
    optionId: string;
}, {
    name: string;
    kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
    optionId: string;
}>;
/** @internal */
declare const toolCallContentSchema: z.ZodUnion<[z.ZodObject<{
    content: z.ZodUnion<[z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        text: z.ZodString;
        type: z.ZodLiteral<"text">;
    }, "strip", z.ZodTypeAny, {
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        data: z.ZodString;
        mimeType: z.ZodString;
        type: z.ZodLiteral<"image">;
        uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    }, {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        data: z.ZodString;
        mimeType: z.ZodString;
        type: z.ZodLiteral<"audio">;
    }, "strip", z.ZodTypeAny, {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        name: z.ZodString;
        size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        type: z.ZodLiteral<"resource_link">;
        uri: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    }, {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        resource: z.ZodUnion<[z.ZodObject<{
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            text: z.ZodString;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        }, {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        }>, z.ZodObject<{
            blob: z.ZodString;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        }, {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        }>]>;
        type: z.ZodLiteral<"resource">;
    }, "strip", z.ZodTypeAny, {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>]>;
    type: z.ZodLiteral<"content">;
}, "strip", z.ZodTypeAny, {
    type: "content";
    content: {
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    } | {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    } | {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    };
}, {
    type: "content";
    content: {
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    } | {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    } | {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    };
}>, z.ZodObject<{
    newText: z.ZodString;
    oldText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    path: z.ZodString;
    type: z.ZodLiteral<"diff">;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "diff";
    newText: string;
    oldText?: string | null | undefined;
}, {
    path: string;
    type: "diff";
    newText: string;
    oldText?: string | null | undefined;
}>, z.ZodObject<{
    terminalId: z.ZodString;
    type: z.ZodLiteral<"terminal">;
}, "strip", z.ZodTypeAny, {
    type: "terminal";
    terminalId: string;
}, {
    type: "terminal";
    terminalId: string;
}>]>;
/** @internal */
declare const toolCallLocationSchema: z.ZodObject<{
    line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    line?: number | null | undefined;
}, {
    path: string;
    line?: number | null | undefined;
}>;
/** @internal */
declare const envVariableSchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: string;
    name: string;
}, {
    value: string;
    name: string;
}>;
/** @internal */
declare const terminalOutputRequestSchema: z.ZodObject<{
    sessionId: z.ZodString;
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    terminalId: string;
}, {
    sessionId: string;
    terminalId: string;
}>;
/** @internal */
declare const releaseTerminalRequestSchema: z.ZodObject<{
    sessionId: z.ZodString;
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    terminalId: string;
}, {
    sessionId: string;
    terminalId: string;
}>;
/** @internal */
declare const waitForTerminalExitRequestSchema: z.ZodObject<{
    sessionId: z.ZodString;
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    terminalId: string;
}, {
    sessionId: string;
    terminalId: string;
}>;
/** @internal */
declare const terminalExitStatusSchema: z.ZodObject<{
    exitCode: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    signal: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    exitCode?: number | null | undefined;
    signal?: string | null | undefined;
}, {
    exitCode?: number | null | undefined;
    signal?: string | null | undefined;
}>;
/** @internal */
declare const fileSystemCapabilitySchema: z.ZodObject<{
    readTextFile: z.ZodOptional<z.ZodBoolean>;
    writeTextFile: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    readTextFile?: boolean | undefined;
    writeTextFile?: boolean | undefined;
}, {
    readTextFile?: boolean | undefined;
    writeTextFile?: boolean | undefined;
}>;
/** @internal */
declare const mcpServerSchema: z.ZodObject<{
    args: z.ZodArray<z.ZodString, "many">;
    command: z.ZodString;
    env: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name: string;
    }, {
        value: string;
        name: string;
    }>, "many">;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    args: string[];
    command: string;
    env: {
        value: string;
        name: string;
    }[];
    name: string;
}, {
    args: string[];
    command: string;
    env: {
        value: string;
        name: string;
    }[];
    name: string;
}>;
/** @internal */
declare const loadSessionRequestSchema: z.ZodObject<{
    cwd: z.ZodString;
    mcpServers: z.ZodArray<z.ZodObject<{
        args: z.ZodArray<z.ZodString, "many">;
        command: z.ZodString;
        env: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            name: string;
        }, {
            value: string;
            name: string;
        }>, "many">;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }>, "many">;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
    sessionId: string;
}, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
    sessionId: string;
}>;
/** @internal */
declare const contentBlockSchema: z.ZodUnion<[z.ZodObject<{
    annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
        lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    }, {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    }>>>;
    text: z.ZodString;
    type: z.ZodLiteral<"text">;
}, "strip", z.ZodTypeAny, {
    type: "text";
    text: string;
    annotations?: {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    } | null | undefined;
}, {
    type: "text";
    text: string;
    annotations?: {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    } | null | undefined;
}>, z.ZodObject<{
    annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
        lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    }, {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    }>>>;
    data: z.ZodString;
    mimeType: z.ZodString;
    type: z.ZodLiteral<"image">;
    uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type: "image";
    data: string;
    mimeType: string;
    annotations?: {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    } | null | undefined;
    uri?: string | null | undefined;
}, {
    type: "image";
    data: string;
    mimeType: string;
    annotations?: {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    } | null | undefined;
    uri?: string | null | undefined;
}>, z.ZodObject<{
    annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
        lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    }, {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    }>>>;
    data: z.ZodString;
    mimeType: z.ZodString;
    type: z.ZodLiteral<"audio">;
}, "strip", z.ZodTypeAny, {
    type: "audio";
    data: string;
    mimeType: string;
    annotations?: {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    } | null | undefined;
}, {
    type: "audio";
    data: string;
    mimeType: string;
    annotations?: {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    } | null | undefined;
}>, z.ZodObject<{
    annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
        lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    }, {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    }>>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    name: z.ZodString;
    size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    type: z.ZodLiteral<"resource_link">;
    uri: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "resource_link";
    name: string;
    uri: string;
    annotations?: {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    } | null | undefined;
    mimeType?: string | null | undefined;
    description?: string | null | undefined;
    size?: number | null | undefined;
    title?: string | null | undefined;
}, {
    type: "resource_link";
    name: string;
    uri: string;
    annotations?: {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    } | null | undefined;
    mimeType?: string | null | undefined;
    description?: string | null | undefined;
    size?: number | null | undefined;
    title?: string | null | undefined;
}>, z.ZodObject<{
    annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
        lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    }, {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    }>>>;
    resource: z.ZodUnion<[z.ZodObject<{
        mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        text: z.ZodString;
        uri: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        uri: string;
        mimeType?: string | null | undefined;
    }, {
        text: string;
        uri: string;
        mimeType?: string | null | undefined;
    }>, z.ZodObject<{
        blob: z.ZodString;
        mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        uri: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        uri: string;
        blob: string;
        mimeType?: string | null | undefined;
    }, {
        uri: string;
        blob: string;
        mimeType?: string | null | undefined;
    }>]>;
    type: z.ZodLiteral<"resource">;
}, "strip", z.ZodTypeAny, {
    type: "resource";
    resource: {
        text: string;
        uri: string;
        mimeType?: string | null | undefined;
    } | {
        uri: string;
        blob: string;
        mimeType?: string | null | undefined;
    };
    annotations?: {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    } | null | undefined;
}, {
    type: "resource";
    resource: {
        text: string;
        uri: string;
        mimeType?: string | null | undefined;
    } | {
        uri: string;
        blob: string;
        mimeType?: string | null | undefined;
    };
    annotations?: {
        audience?: ("assistant" | "user")[] | null | undefined;
        lastModified?: string | null | undefined;
        priority?: number | null | undefined;
    } | null | undefined;
}>]>;
/** @internal */
declare const authMethodSchema: z.ZodObject<{
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    id: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description?: string | null | undefined;
}, {
    id: string;
    name: string;
    description?: string | null | undefined;
}>;
/** @internal */
declare const promptCapabilitiesSchema: z.ZodObject<{
    audio: z.ZodOptional<z.ZodBoolean>;
    embeddedContext: z.ZodOptional<z.ZodBoolean>;
    image: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    image?: boolean | undefined;
    audio?: boolean | undefined;
    embeddedContext?: boolean | undefined;
}, {
    image?: boolean | undefined;
    audio?: boolean | undefined;
    embeddedContext?: boolean | undefined;
}>;
/** @internal */
declare const planEntrySchema: z.ZodObject<{
    content: z.ZodString;
    priority: z.ZodUnion<[z.ZodLiteral<"high">, z.ZodLiteral<"medium">, z.ZodLiteral<"low">]>;
    status: z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">]>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "in_progress" | "completed";
    priority: "high" | "medium" | "low";
    content: string;
}, {
    status: "pending" | "in_progress" | "completed";
    priority: "high" | "medium" | "low";
    content: string;
}>;
/** @internal */
declare const clientNotificationSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
/** @internal */
declare const createTerminalRequestSchema: z.ZodObject<{
    args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    command: z.ZodString;
    cwd: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    env: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name: string;
    }, {
        value: string;
        name: string;
    }>, "many">>;
    outputByteLimit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    command: string;
    sessionId: string;
    cwd?: string | null | undefined;
    args?: string[] | undefined;
    env?: {
        value: string;
        name: string;
    }[] | undefined;
    outputByteLimit?: number | null | undefined;
}, {
    command: string;
    sessionId: string;
    cwd?: string | null | undefined;
    args?: string[] | undefined;
    env?: {
        value: string;
        name: string;
    }[] | undefined;
    outputByteLimit?: number | null | undefined;
}>;
/** @internal */
declare const terminalOutputResponseSchema: z.ZodObject<{
    exitStatus: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        exitCode: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        signal: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    }, {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    }>>>;
    output: z.ZodString;
    truncated: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    output: string;
    truncated: boolean;
    exitStatus?: {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    } | null | undefined;
}, {
    output: string;
    truncated: boolean;
    exitStatus?: {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    } | null | undefined;
}>;
/** @internal */
declare const newSessionRequestSchema: z.ZodObject<{
    cwd: z.ZodString;
    mcpServers: z.ZodArray<z.ZodObject<{
        args: z.ZodArray<z.ZodString, "many">;
        command: z.ZodString;
        env: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            name: string;
        }, {
            value: string;
            name: string;
        }>, "many">;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
}, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
}>;
/** @internal */
declare const promptRequestSchema: z.ZodObject<{
    prompt: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        text: z.ZodString;
        type: z.ZodLiteral<"text">;
    }, "strip", z.ZodTypeAny, {
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        data: z.ZodString;
        mimeType: z.ZodString;
        type: z.ZodLiteral<"image">;
        uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    }, {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        data: z.ZodString;
        mimeType: z.ZodString;
        type: z.ZodLiteral<"audio">;
    }, "strip", z.ZodTypeAny, {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        name: z.ZodString;
        size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        type: z.ZodLiteral<"resource_link">;
        uri: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    }, {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        resource: z.ZodUnion<[z.ZodObject<{
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            text: z.ZodString;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        }, {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        }>, z.ZodObject<{
            blob: z.ZodString;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        }, {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        }>]>;
        type: z.ZodLiteral<"resource">;
    }, "strip", z.ZodTypeAny, {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>]>, "many">;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    prompt: ({
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    } | {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    } | {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    })[];
}, {
    sessionId: string;
    prompt: ({
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    } | {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    } | {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    })[];
}>;
/** @internal */
declare const sessionNotificationSchema: z.ZodObject<{
    sessionId: z.ZodString;
    update: z.ZodUnion<[z.ZodObject<{
        content: z.ZodUnion<[z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            text: z.ZodString;
            type: z.ZodLiteral<"text">;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"image">;
            uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"audio">;
        }, "strip", z.ZodTypeAny, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            name: z.ZodString;
            size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            type: z.ZodLiteral<"resource_link">;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            resource: z.ZodUnion<[z.ZodObject<{
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                text: z.ZodString;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }>, z.ZodObject<{
                blob: z.ZodString;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }>]>;
            type: z.ZodLiteral<"resource">;
        }, "strip", z.ZodTypeAny, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>]>;
        sessionUpdate: z.ZodLiteral<"user_message_chunk">;
    }, "strip", z.ZodTypeAny, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    }, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    }>, z.ZodObject<{
        content: z.ZodUnion<[z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            text: z.ZodString;
            type: z.ZodLiteral<"text">;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"image">;
            uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"audio">;
        }, "strip", z.ZodTypeAny, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            name: z.ZodString;
            size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            type: z.ZodLiteral<"resource_link">;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            resource: z.ZodUnion<[z.ZodObject<{
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                text: z.ZodString;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }>, z.ZodObject<{
                blob: z.ZodString;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }>]>;
            type: z.ZodLiteral<"resource">;
        }, "strip", z.ZodTypeAny, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>]>;
        sessionUpdate: z.ZodLiteral<"agent_message_chunk">;
    }, "strip", z.ZodTypeAny, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    }, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    }>, z.ZodObject<{
        content: z.ZodUnion<[z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            text: z.ZodString;
            type: z.ZodLiteral<"text">;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"image">;
            uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"audio">;
        }, "strip", z.ZodTypeAny, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            name: z.ZodString;
            size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            type: z.ZodLiteral<"resource_link">;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            resource: z.ZodUnion<[z.ZodObject<{
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                text: z.ZodString;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }>, z.ZodObject<{
                blob: z.ZodString;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }>]>;
            type: z.ZodLiteral<"resource">;
        }, "strip", z.ZodTypeAny, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>]>;
        sessionUpdate: z.ZodLiteral<"agent_thought_chunk">;
    }, "strip", z.ZodTypeAny, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    }, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    }>, z.ZodObject<{
        content: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            content: z.ZodUnion<[z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                text: z.ZodString;
                type: z.ZodLiteral<"text">;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"image">;
                uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"audio">;
            }, "strip", z.ZodTypeAny, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                name: z.ZodString;
                size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                type: z.ZodLiteral<"resource_link">;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                resource: z.ZodUnion<[z.ZodObject<{
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    text: z.ZodString;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }>, z.ZodObject<{
                    blob: z.ZodString;
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }>]>;
                type: z.ZodLiteral<"resource">;
            }, "strip", z.ZodTypeAny, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>]>;
            type: z.ZodLiteral<"content">;
        }, "strip", z.ZodTypeAny, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }>, z.ZodObject<{
            newText: z.ZodString;
            oldText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            path: z.ZodString;
            type: z.ZodLiteral<"diff">;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }>, z.ZodObject<{
            terminalId: z.ZodString;
            type: z.ZodLiteral<"terminal">;
        }, "strip", z.ZodTypeAny, {
            type: "terminal";
            terminalId: string;
        }, {
            type: "terminal";
            terminalId: string;
        }>]>, "many">>;
        kind: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"read">, z.ZodLiteral<"edit">, z.ZodLiteral<"delete">, z.ZodLiteral<"move">, z.ZodLiteral<"search">, z.ZodLiteral<"execute">, z.ZodLiteral<"think">, z.ZodLiteral<"fetch">, z.ZodLiteral<"other">]>>;
        locations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            line?: number | null | undefined;
        }, {
            path: string;
            line?: number | null | undefined;
        }>, "many">>;
        rawInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        rawOutput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        sessionUpdate: z.ZodLiteral<"tool_call">;
        status: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">, z.ZodLiteral<"failed">]>>;
        title: z.ZodString;
        toolCallId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }, {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }>, z.ZodObject<{
        content: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            content: z.ZodUnion<[z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                text: z.ZodString;
                type: z.ZodLiteral<"text">;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"image">;
                uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"audio">;
            }, "strip", z.ZodTypeAny, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                name: z.ZodString;
                size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                type: z.ZodLiteral<"resource_link">;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                resource: z.ZodUnion<[z.ZodObject<{
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    text: z.ZodString;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }>, z.ZodObject<{
                    blob: z.ZodString;
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }>]>;
                type: z.ZodLiteral<"resource">;
            }, "strip", z.ZodTypeAny, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>]>;
            type: z.ZodLiteral<"content">;
        }, "strip", z.ZodTypeAny, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }>, z.ZodObject<{
            newText: z.ZodString;
            oldText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            path: z.ZodString;
            type: z.ZodLiteral<"diff">;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }>, z.ZodObject<{
            terminalId: z.ZodString;
            type: z.ZodLiteral<"terminal">;
        }, "strip", z.ZodTypeAny, {
            type: "terminal";
            terminalId: string;
        }, {
            type: "terminal";
            terminalId: string;
        }>]>, "many">>>;
        kind: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"read">, z.ZodLiteral<"edit">, z.ZodLiteral<"delete">, z.ZodLiteral<"move">, z.ZodLiteral<"search">, z.ZodLiteral<"execute">, z.ZodLiteral<"think">, z.ZodLiteral<"fetch">, z.ZodLiteral<"other">]>>>;
        locations: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
            line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            line?: number | null | undefined;
        }, {
            path: string;
            line?: number | null | undefined;
        }>, "many">>>;
        rawInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        rawOutput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        sessionUpdate: z.ZodLiteral<"tool_call_update">;
        status: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">, z.ZodLiteral<"failed">]>>>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        toolCallId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }, {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }>, z.ZodObject<{
        entries: z.ZodArray<z.ZodObject<{
            content: z.ZodString;
            priority: z.ZodUnion<[z.ZodLiteral<"high">, z.ZodLiteral<"medium">, z.ZodLiteral<"low">]>;
            status: z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">]>;
        }, "strip", z.ZodTypeAny, {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }, {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }>, "many">;
        sessionUpdate: z.ZodLiteral<"plan">;
    }, "strip", z.ZodTypeAny, {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    }, {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    }>]>;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    update: {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    } | {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    };
}, {
    sessionId: string;
    update: {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    } | {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    };
}>;
/** @internal */
declare const toolCallUpdateSchema: z.ZodObject<{
    content: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        content: z.ZodUnion<[z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            text: z.ZodString;
            type: z.ZodLiteral<"text">;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"image">;
            uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"audio">;
        }, "strip", z.ZodTypeAny, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            name: z.ZodString;
            size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            type: z.ZodLiteral<"resource_link">;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            resource: z.ZodUnion<[z.ZodObject<{
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                text: z.ZodString;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }>, z.ZodObject<{
                blob: z.ZodString;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }>]>;
            type: z.ZodLiteral<"resource">;
        }, "strip", z.ZodTypeAny, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>]>;
        type: z.ZodLiteral<"content">;
    }, "strip", z.ZodTypeAny, {
        type: "content";
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
    }, {
        type: "content";
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
    }>, z.ZodObject<{
        newText: z.ZodString;
        oldText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        path: z.ZodString;
        type: z.ZodLiteral<"diff">;
    }, "strip", z.ZodTypeAny, {
        path: string;
        type: "diff";
        newText: string;
        oldText?: string | null | undefined;
    }, {
        path: string;
        type: "diff";
        newText: string;
        oldText?: string | null | undefined;
    }>, z.ZodObject<{
        terminalId: z.ZodString;
        type: z.ZodLiteral<"terminal">;
    }, "strip", z.ZodTypeAny, {
        type: "terminal";
        terminalId: string;
    }, {
        type: "terminal";
        terminalId: string;
    }>]>, "many">>>;
    kind: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"read">, z.ZodLiteral<"edit">, z.ZodLiteral<"delete">, z.ZodLiteral<"move">, z.ZodLiteral<"search">, z.ZodLiteral<"execute">, z.ZodLiteral<"think">, z.ZodLiteral<"fetch">, z.ZodLiteral<"other">]>>>;
    locations: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
        line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
        line?: number | null | undefined;
    }, {
        path: string;
        line?: number | null | undefined;
    }>, "many">>>;
    rawInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    rawOutput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    status: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">, z.ZodLiteral<"failed">]>>>;
    title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    toolCallId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    toolCallId: string;
    status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
    title?: string | null | undefined;
    content?: ({
        type: "content";
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
    } | {
        path: string;
        type: "diff";
        newText: string;
        oldText?: string | null | undefined;
    } | {
        type: "terminal";
        terminalId: string;
    })[] | null | undefined;
    kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
    locations?: {
        path: string;
        line?: number | null | undefined;
    }[] | null | undefined;
    rawInput?: Record<string, unknown> | undefined;
    rawOutput?: Record<string, unknown> | undefined;
}, {
    toolCallId: string;
    status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
    title?: string | null | undefined;
    content?: ({
        type: "content";
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
    } | {
        path: string;
        type: "diff";
        newText: string;
        oldText?: string | null | undefined;
    } | {
        type: "terminal";
        terminalId: string;
    })[] | null | undefined;
    kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
    locations?: {
        path: string;
        line?: number | null | undefined;
    }[] | null | undefined;
    rawInput?: Record<string, unknown> | undefined;
    rawOutput?: Record<string, unknown> | undefined;
}>;
/** @internal */
declare const clientCapabilitiesSchema: z.ZodObject<{
    fs: z.ZodOptional<z.ZodObject<{
        readTextFile: z.ZodOptional<z.ZodBoolean>;
        writeTextFile: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        readTextFile?: boolean | undefined;
        writeTextFile?: boolean | undefined;
    }, {
        readTextFile?: boolean | undefined;
        writeTextFile?: boolean | undefined;
    }>>;
    terminal: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    fs?: {
        readTextFile?: boolean | undefined;
        writeTextFile?: boolean | undefined;
    } | undefined;
    terminal?: boolean | undefined;
}, {
    fs?: {
        readTextFile?: boolean | undefined;
        writeTextFile?: boolean | undefined;
    } | undefined;
    terminal?: boolean | undefined;
}>;
/** @internal */
declare const agentCapabilitiesSchema: z.ZodObject<{
    loadSession: z.ZodOptional<z.ZodBoolean>;
    promptCapabilities: z.ZodOptional<z.ZodObject<{
        audio: z.ZodOptional<z.ZodBoolean>;
        embeddedContext: z.ZodOptional<z.ZodBoolean>;
        image: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        image?: boolean | undefined;
        audio?: boolean | undefined;
        embeddedContext?: boolean | undefined;
    }, {
        image?: boolean | undefined;
        audio?: boolean | undefined;
        embeddedContext?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    loadSession?: boolean | undefined;
    promptCapabilities?: {
        image?: boolean | undefined;
        audio?: boolean | undefined;
        embeddedContext?: boolean | undefined;
    } | undefined;
}, {
    loadSession?: boolean | undefined;
    promptCapabilities?: {
        image?: boolean | undefined;
        audio?: boolean | undefined;
        embeddedContext?: boolean | undefined;
    } | undefined;
}>;
/** @internal */
declare const clientResponseSchema: z.ZodUnion<[z.ZodNull, z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>, z.ZodObject<{
    outcome: z.ZodUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"cancelled">;
    }, "strip", z.ZodTypeAny, {
        outcome: "cancelled";
    }, {
        outcome: "cancelled";
    }>, z.ZodObject<{
        optionId: z.ZodString;
        outcome: z.ZodLiteral<"selected">;
    }, "strip", z.ZodTypeAny, {
        optionId: string;
        outcome: "selected";
    }, {
        optionId: string;
        outcome: "selected";
    }>]>;
}, "strip", z.ZodTypeAny, {
    outcome: {
        outcome: "cancelled";
    } | {
        optionId: string;
        outcome: "selected";
    };
}, {
    outcome: {
        outcome: "cancelled";
    } | {
        optionId: string;
        outcome: "selected";
    };
}>, z.ZodObject<{
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    terminalId: string;
}, {
    terminalId: string;
}>, z.ZodObject<{
    exitStatus: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        exitCode: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        signal: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    }, {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    }>>>;
    output: z.ZodString;
    truncated: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    output: string;
    truncated: boolean;
    exitStatus?: {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    } | null | undefined;
}, {
    output: string;
    truncated: boolean;
    exitStatus?: {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    } | null | undefined;
}>, z.ZodNull, z.ZodObject<{
    exitCode: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    signal: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    exitCode?: number | null | undefined;
    signal?: string | null | undefined;
}, {
    exitCode?: number | null | undefined;
    signal?: string | null | undefined;
}>]>;
/** @internal */
declare const agentNotificationSchema: z.ZodObject<{
    sessionId: z.ZodString;
    update: z.ZodUnion<[z.ZodObject<{
        content: z.ZodUnion<[z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            text: z.ZodString;
            type: z.ZodLiteral<"text">;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"image">;
            uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"audio">;
        }, "strip", z.ZodTypeAny, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            name: z.ZodString;
            size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            type: z.ZodLiteral<"resource_link">;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            resource: z.ZodUnion<[z.ZodObject<{
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                text: z.ZodString;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }>, z.ZodObject<{
                blob: z.ZodString;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }>]>;
            type: z.ZodLiteral<"resource">;
        }, "strip", z.ZodTypeAny, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>]>;
        sessionUpdate: z.ZodLiteral<"user_message_chunk">;
    }, "strip", z.ZodTypeAny, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    }, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    }>, z.ZodObject<{
        content: z.ZodUnion<[z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            text: z.ZodString;
            type: z.ZodLiteral<"text">;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"image">;
            uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"audio">;
        }, "strip", z.ZodTypeAny, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            name: z.ZodString;
            size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            type: z.ZodLiteral<"resource_link">;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            resource: z.ZodUnion<[z.ZodObject<{
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                text: z.ZodString;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }>, z.ZodObject<{
                blob: z.ZodString;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }>]>;
            type: z.ZodLiteral<"resource">;
        }, "strip", z.ZodTypeAny, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>]>;
        sessionUpdate: z.ZodLiteral<"agent_message_chunk">;
    }, "strip", z.ZodTypeAny, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    }, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    }>, z.ZodObject<{
        content: z.ZodUnion<[z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            text: z.ZodString;
            type: z.ZodLiteral<"text">;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"image">;
            uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"audio">;
        }, "strip", z.ZodTypeAny, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            name: z.ZodString;
            size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            type: z.ZodLiteral<"resource_link">;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            resource: z.ZodUnion<[z.ZodObject<{
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                text: z.ZodString;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }>, z.ZodObject<{
                blob: z.ZodString;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }>]>;
            type: z.ZodLiteral<"resource">;
        }, "strip", z.ZodTypeAny, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>]>;
        sessionUpdate: z.ZodLiteral<"agent_thought_chunk">;
    }, "strip", z.ZodTypeAny, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    }, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    }>, z.ZodObject<{
        content: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            content: z.ZodUnion<[z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                text: z.ZodString;
                type: z.ZodLiteral<"text">;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"image">;
                uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"audio">;
            }, "strip", z.ZodTypeAny, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                name: z.ZodString;
                size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                type: z.ZodLiteral<"resource_link">;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                resource: z.ZodUnion<[z.ZodObject<{
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    text: z.ZodString;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }>, z.ZodObject<{
                    blob: z.ZodString;
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }>]>;
                type: z.ZodLiteral<"resource">;
            }, "strip", z.ZodTypeAny, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>]>;
            type: z.ZodLiteral<"content">;
        }, "strip", z.ZodTypeAny, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }>, z.ZodObject<{
            newText: z.ZodString;
            oldText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            path: z.ZodString;
            type: z.ZodLiteral<"diff">;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }>, z.ZodObject<{
            terminalId: z.ZodString;
            type: z.ZodLiteral<"terminal">;
        }, "strip", z.ZodTypeAny, {
            type: "terminal";
            terminalId: string;
        }, {
            type: "terminal";
            terminalId: string;
        }>]>, "many">>;
        kind: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"read">, z.ZodLiteral<"edit">, z.ZodLiteral<"delete">, z.ZodLiteral<"move">, z.ZodLiteral<"search">, z.ZodLiteral<"execute">, z.ZodLiteral<"think">, z.ZodLiteral<"fetch">, z.ZodLiteral<"other">]>>;
        locations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            line?: number | null | undefined;
        }, {
            path: string;
            line?: number | null | undefined;
        }>, "many">>;
        rawInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        rawOutput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        sessionUpdate: z.ZodLiteral<"tool_call">;
        status: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">, z.ZodLiteral<"failed">]>>;
        title: z.ZodString;
        toolCallId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }, {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }>, z.ZodObject<{
        content: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            content: z.ZodUnion<[z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                text: z.ZodString;
                type: z.ZodLiteral<"text">;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"image">;
                uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"audio">;
            }, "strip", z.ZodTypeAny, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                name: z.ZodString;
                size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                type: z.ZodLiteral<"resource_link">;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                resource: z.ZodUnion<[z.ZodObject<{
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    text: z.ZodString;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }>, z.ZodObject<{
                    blob: z.ZodString;
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }>]>;
                type: z.ZodLiteral<"resource">;
            }, "strip", z.ZodTypeAny, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>]>;
            type: z.ZodLiteral<"content">;
        }, "strip", z.ZodTypeAny, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }>, z.ZodObject<{
            newText: z.ZodString;
            oldText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            path: z.ZodString;
            type: z.ZodLiteral<"diff">;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }>, z.ZodObject<{
            terminalId: z.ZodString;
            type: z.ZodLiteral<"terminal">;
        }, "strip", z.ZodTypeAny, {
            type: "terminal";
            terminalId: string;
        }, {
            type: "terminal";
            terminalId: string;
        }>]>, "many">>>;
        kind: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"read">, z.ZodLiteral<"edit">, z.ZodLiteral<"delete">, z.ZodLiteral<"move">, z.ZodLiteral<"search">, z.ZodLiteral<"execute">, z.ZodLiteral<"think">, z.ZodLiteral<"fetch">, z.ZodLiteral<"other">]>>>;
        locations: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
            line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            line?: number | null | undefined;
        }, {
            path: string;
            line?: number | null | undefined;
        }>, "many">>>;
        rawInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        rawOutput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        sessionUpdate: z.ZodLiteral<"tool_call_update">;
        status: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">, z.ZodLiteral<"failed">]>>>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        toolCallId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }, {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }>, z.ZodObject<{
        entries: z.ZodArray<z.ZodObject<{
            content: z.ZodString;
            priority: z.ZodUnion<[z.ZodLiteral<"high">, z.ZodLiteral<"medium">, z.ZodLiteral<"low">]>;
            status: z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">]>;
        }, "strip", z.ZodTypeAny, {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }, {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }>, "many">;
        sessionUpdate: z.ZodLiteral<"plan">;
    }, "strip", z.ZodTypeAny, {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    }, {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    }>]>;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    update: {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    } | {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    };
}, {
    sessionId: string;
    update: {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    } | {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    };
}>;
/** @internal */
declare const requestPermissionRequestSchema: z.ZodObject<{
    options: z.ZodArray<z.ZodObject<{
        kind: z.ZodUnion<[z.ZodLiteral<"allow_once">, z.ZodLiteral<"allow_always">, z.ZodLiteral<"reject_once">, z.ZodLiteral<"reject_always">]>;
        name: z.ZodString;
        optionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }, {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }>, "many">;
    sessionId: z.ZodString;
    toolCall: z.ZodObject<{
        content: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            content: z.ZodUnion<[z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                text: z.ZodString;
                type: z.ZodLiteral<"text">;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"image">;
                uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"audio">;
            }, "strip", z.ZodTypeAny, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                name: z.ZodString;
                size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                type: z.ZodLiteral<"resource_link">;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                resource: z.ZodUnion<[z.ZodObject<{
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    text: z.ZodString;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }>, z.ZodObject<{
                    blob: z.ZodString;
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }>]>;
                type: z.ZodLiteral<"resource">;
            }, "strip", z.ZodTypeAny, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>]>;
            type: z.ZodLiteral<"content">;
        }, "strip", z.ZodTypeAny, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }>, z.ZodObject<{
            newText: z.ZodString;
            oldText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            path: z.ZodString;
            type: z.ZodLiteral<"diff">;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }>, z.ZodObject<{
            terminalId: z.ZodString;
            type: z.ZodLiteral<"terminal">;
        }, "strip", z.ZodTypeAny, {
            type: "terminal";
            terminalId: string;
        }, {
            type: "terminal";
            terminalId: string;
        }>]>, "many">>>;
        kind: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"read">, z.ZodLiteral<"edit">, z.ZodLiteral<"delete">, z.ZodLiteral<"move">, z.ZodLiteral<"search">, z.ZodLiteral<"execute">, z.ZodLiteral<"think">, z.ZodLiteral<"fetch">, z.ZodLiteral<"other">]>>>;
        locations: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
            line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            line?: number | null | undefined;
        }, {
            path: string;
            line?: number | null | undefined;
        }>, "many">>>;
        rawInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        rawOutput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        status: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">, z.ZodLiteral<"failed">]>>>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        toolCallId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }, {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    options: {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }[];
    sessionId: string;
    toolCall: {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    };
}, {
    options: {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }[];
    sessionId: string;
    toolCall: {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    };
}>;
/** @internal */
declare const initializeRequestSchema: z.ZodObject<{
    clientCapabilities: z.ZodOptional<z.ZodObject<{
        fs: z.ZodOptional<z.ZodObject<{
            readTextFile: z.ZodOptional<z.ZodBoolean>;
            writeTextFile: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        }, {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        }>>;
        terminal: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    }, {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    }>>;
    protocolVersion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    protocolVersion: number;
    clientCapabilities?: {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    } | undefined;
}, {
    protocolVersion: number;
    clientCapabilities?: {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    } | undefined;
}>;
/** @internal */
declare const initializeResponseSchema: z.ZodObject<{
    agentCapabilities: z.ZodOptional<z.ZodObject<{
        loadSession: z.ZodOptional<z.ZodBoolean>;
        promptCapabilities: z.ZodOptional<z.ZodObject<{
            audio: z.ZodOptional<z.ZodBoolean>;
            embeddedContext: z.ZodOptional<z.ZodBoolean>;
            image: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        }, {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    }, {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    }>>;
    authMethods: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        description?: string | null | undefined;
    }, {
        id: string;
        name: string;
        description?: string | null | undefined;
    }>, "many">>;
    protocolVersion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    protocolVersion: number;
    agentCapabilities?: {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    } | undefined;
    authMethods?: {
        id: string;
        name: string;
        description?: string | null | undefined;
    }[] | undefined;
}, {
    protocolVersion: number;
    agentCapabilities?: {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    } | undefined;
    authMethods?: {
        id: string;
        name: string;
        description?: string | null | undefined;
    }[] | undefined;
}>;
/** @internal */
declare const clientRequestSchema: z.ZodUnion<[z.ZodObject<{
    content: z.ZodString;
    path: z.ZodString;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    sessionId: string;
    content: string;
}, {
    path: string;
    sessionId: string;
    content: string;
}>, z.ZodObject<{
    limit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    path: z.ZodString;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    sessionId: string;
    limit?: number | null | undefined;
    line?: number | null | undefined;
}, {
    path: string;
    sessionId: string;
    limit?: number | null | undefined;
    line?: number | null | undefined;
}>, z.ZodObject<{
    options: z.ZodArray<z.ZodObject<{
        kind: z.ZodUnion<[z.ZodLiteral<"allow_once">, z.ZodLiteral<"allow_always">, z.ZodLiteral<"reject_once">, z.ZodLiteral<"reject_always">]>;
        name: z.ZodString;
        optionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }, {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }>, "many">;
    sessionId: z.ZodString;
    toolCall: z.ZodObject<{
        content: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            content: z.ZodUnion<[z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                text: z.ZodString;
                type: z.ZodLiteral<"text">;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"image">;
                uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"audio">;
            }, "strip", z.ZodTypeAny, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                name: z.ZodString;
                size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                type: z.ZodLiteral<"resource_link">;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                resource: z.ZodUnion<[z.ZodObject<{
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    text: z.ZodString;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }>, z.ZodObject<{
                    blob: z.ZodString;
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }>]>;
                type: z.ZodLiteral<"resource">;
            }, "strip", z.ZodTypeAny, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>]>;
            type: z.ZodLiteral<"content">;
        }, "strip", z.ZodTypeAny, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }>, z.ZodObject<{
            newText: z.ZodString;
            oldText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            path: z.ZodString;
            type: z.ZodLiteral<"diff">;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }>, z.ZodObject<{
            terminalId: z.ZodString;
            type: z.ZodLiteral<"terminal">;
        }, "strip", z.ZodTypeAny, {
            type: "terminal";
            terminalId: string;
        }, {
            type: "terminal";
            terminalId: string;
        }>]>, "many">>>;
        kind: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"read">, z.ZodLiteral<"edit">, z.ZodLiteral<"delete">, z.ZodLiteral<"move">, z.ZodLiteral<"search">, z.ZodLiteral<"execute">, z.ZodLiteral<"think">, z.ZodLiteral<"fetch">, z.ZodLiteral<"other">]>>>;
        locations: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
            line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            line?: number | null | undefined;
        }, {
            path: string;
            line?: number | null | undefined;
        }>, "many">>>;
        rawInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        rawOutput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        status: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">, z.ZodLiteral<"failed">]>>>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        toolCallId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }, {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    options: {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }[];
    sessionId: string;
    toolCall: {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    };
}, {
    options: {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }[];
    sessionId: string;
    toolCall: {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    };
}>, z.ZodObject<{
    args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    command: z.ZodString;
    cwd: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    env: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name: string;
    }, {
        value: string;
        name: string;
    }>, "many">>;
    outputByteLimit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    command: string;
    sessionId: string;
    cwd?: string | null | undefined;
    args?: string[] | undefined;
    env?: {
        value: string;
        name: string;
    }[] | undefined;
    outputByteLimit?: number | null | undefined;
}, {
    command: string;
    sessionId: string;
    cwd?: string | null | undefined;
    args?: string[] | undefined;
    env?: {
        value: string;
        name: string;
    }[] | undefined;
    outputByteLimit?: number | null | undefined;
}>, z.ZodObject<{
    sessionId: z.ZodString;
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    terminalId: string;
}, {
    sessionId: string;
    terminalId: string;
}>, z.ZodObject<{
    sessionId: z.ZodString;
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    terminalId: string;
}, {
    sessionId: string;
    terminalId: string;
}>, z.ZodObject<{
    sessionId: z.ZodString;
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    terminalId: string;
}, {
    sessionId: string;
    terminalId: string;
}>]>;
/** @internal */
declare const agentRequestSchema: z.ZodUnion<[z.ZodObject<{
    clientCapabilities: z.ZodOptional<z.ZodObject<{
        fs: z.ZodOptional<z.ZodObject<{
            readTextFile: z.ZodOptional<z.ZodBoolean>;
            writeTextFile: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        }, {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        }>>;
        terminal: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    }, {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    }>>;
    protocolVersion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    protocolVersion: number;
    clientCapabilities?: {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    } | undefined;
}, {
    protocolVersion: number;
    clientCapabilities?: {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    } | undefined;
}>, z.ZodObject<{
    methodId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    methodId: string;
}, {
    methodId: string;
}>, z.ZodObject<{
    cwd: z.ZodString;
    mcpServers: z.ZodArray<z.ZodObject<{
        args: z.ZodArray<z.ZodString, "many">;
        command: z.ZodString;
        env: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            name: string;
        }, {
            value: string;
            name: string;
        }>, "many">;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
}, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
}>, z.ZodObject<{
    cwd: z.ZodString;
    mcpServers: z.ZodArray<z.ZodObject<{
        args: z.ZodArray<z.ZodString, "many">;
        command: z.ZodString;
        env: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            name: string;
        }, {
            value: string;
            name: string;
        }>, "many">;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }>, "many">;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
    sessionId: string;
}, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
    sessionId: string;
}>, z.ZodObject<{
    prompt: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        text: z.ZodString;
        type: z.ZodLiteral<"text">;
    }, "strip", z.ZodTypeAny, {
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        data: z.ZodString;
        mimeType: z.ZodString;
        type: z.ZodLiteral<"image">;
        uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    }, {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        data: z.ZodString;
        mimeType: z.ZodString;
        type: z.ZodLiteral<"audio">;
    }, "strip", z.ZodTypeAny, {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        name: z.ZodString;
        size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        type: z.ZodLiteral<"resource_link">;
        uri: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    }, {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        resource: z.ZodUnion<[z.ZodObject<{
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            text: z.ZodString;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        }, {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        }>, z.ZodObject<{
            blob: z.ZodString;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        }, {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        }>]>;
        type: z.ZodLiteral<"resource">;
    }, "strip", z.ZodTypeAny, {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>]>, "many">;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    prompt: ({
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    } | {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    } | {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    })[];
}, {
    sessionId: string;
    prompt: ({
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    } | {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    } | {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    })[];
}>]>;
/** @internal */
declare const agentResponseSchema: z.ZodUnion<[z.ZodObject<{
    agentCapabilities: z.ZodOptional<z.ZodObject<{
        loadSession: z.ZodOptional<z.ZodBoolean>;
        promptCapabilities: z.ZodOptional<z.ZodObject<{
            audio: z.ZodOptional<z.ZodBoolean>;
            embeddedContext: z.ZodOptional<z.ZodBoolean>;
            image: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        }, {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    }, {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    }>>;
    authMethods: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        description?: string | null | undefined;
    }, {
        id: string;
        name: string;
        description?: string | null | undefined;
    }>, "many">>;
    protocolVersion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    protocolVersion: number;
    agentCapabilities?: {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    } | undefined;
    authMethods?: {
        id: string;
        name: string;
        description?: string | null | undefined;
    }[] | undefined;
}, {
    protocolVersion: number;
    agentCapabilities?: {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    } | undefined;
    authMethods?: {
        id: string;
        name: string;
        description?: string | null | undefined;
    }[] | undefined;
}>, z.ZodNull, z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>, z.ZodNull, z.ZodObject<{
    stopReason: z.ZodUnion<[z.ZodLiteral<"end_turn">, z.ZodLiteral<"max_tokens">, z.ZodLiteral<"max_turn_requests">, z.ZodLiteral<"refusal">, z.ZodLiteral<"cancelled">]>;
}, "strip", z.ZodTypeAny, {
    stopReason: "cancelled" | "end_turn" | "max_tokens" | "max_turn_requests" | "refusal";
}, {
    stopReason: "cancelled" | "end_turn" | "max_tokens" | "max_turn_requests" | "refusal";
}>]>;
/** @internal */
declare const agentClientProtocolSchema: z.ZodUnion<[z.ZodUnion<[z.ZodObject<{
    content: z.ZodString;
    path: z.ZodString;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    sessionId: string;
    content: string;
}, {
    path: string;
    sessionId: string;
    content: string;
}>, z.ZodObject<{
    limit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    path: z.ZodString;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    sessionId: string;
    limit?: number | null | undefined;
    line?: number | null | undefined;
}, {
    path: string;
    sessionId: string;
    limit?: number | null | undefined;
    line?: number | null | undefined;
}>, z.ZodObject<{
    options: z.ZodArray<z.ZodObject<{
        kind: z.ZodUnion<[z.ZodLiteral<"allow_once">, z.ZodLiteral<"allow_always">, z.ZodLiteral<"reject_once">, z.ZodLiteral<"reject_always">]>;
        name: z.ZodString;
        optionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }, {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }>, "many">;
    sessionId: z.ZodString;
    toolCall: z.ZodObject<{
        content: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            content: z.ZodUnion<[z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                text: z.ZodString;
                type: z.ZodLiteral<"text">;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"image">;
                uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"audio">;
            }, "strip", z.ZodTypeAny, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                name: z.ZodString;
                size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                type: z.ZodLiteral<"resource_link">;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                resource: z.ZodUnion<[z.ZodObject<{
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    text: z.ZodString;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }>, z.ZodObject<{
                    blob: z.ZodString;
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }>]>;
                type: z.ZodLiteral<"resource">;
            }, "strip", z.ZodTypeAny, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>]>;
            type: z.ZodLiteral<"content">;
        }, "strip", z.ZodTypeAny, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }>, z.ZodObject<{
            newText: z.ZodString;
            oldText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            path: z.ZodString;
            type: z.ZodLiteral<"diff">;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }>, z.ZodObject<{
            terminalId: z.ZodString;
            type: z.ZodLiteral<"terminal">;
        }, "strip", z.ZodTypeAny, {
            type: "terminal";
            terminalId: string;
        }, {
            type: "terminal";
            terminalId: string;
        }>]>, "many">>>;
        kind: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"read">, z.ZodLiteral<"edit">, z.ZodLiteral<"delete">, z.ZodLiteral<"move">, z.ZodLiteral<"search">, z.ZodLiteral<"execute">, z.ZodLiteral<"think">, z.ZodLiteral<"fetch">, z.ZodLiteral<"other">]>>>;
        locations: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
            line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            line?: number | null | undefined;
        }, {
            path: string;
            line?: number | null | undefined;
        }>, "many">>>;
        rawInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        rawOutput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        status: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">, z.ZodLiteral<"failed">]>>>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        toolCallId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }, {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    options: {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }[];
    sessionId: string;
    toolCall: {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    };
}, {
    options: {
        name: string;
        kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
        optionId: string;
    }[];
    sessionId: string;
    toolCall: {
        toolCallId: string;
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    };
}>, z.ZodObject<{
    args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    command: z.ZodString;
    cwd: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    env: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name: string;
    }, {
        value: string;
        name: string;
    }>, "many">>;
    outputByteLimit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    command: string;
    sessionId: string;
    cwd?: string | null | undefined;
    args?: string[] | undefined;
    env?: {
        value: string;
        name: string;
    }[] | undefined;
    outputByteLimit?: number | null | undefined;
}, {
    command: string;
    sessionId: string;
    cwd?: string | null | undefined;
    args?: string[] | undefined;
    env?: {
        value: string;
        name: string;
    }[] | undefined;
    outputByteLimit?: number | null | undefined;
}>, z.ZodObject<{
    sessionId: z.ZodString;
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    terminalId: string;
}, {
    sessionId: string;
    terminalId: string;
}>, z.ZodObject<{
    sessionId: z.ZodString;
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    terminalId: string;
}, {
    sessionId: string;
    terminalId: string;
}>, z.ZodObject<{
    sessionId: z.ZodString;
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    terminalId: string;
}, {
    sessionId: string;
    terminalId: string;
}>]>, z.ZodUnion<[z.ZodNull, z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>, z.ZodObject<{
    outcome: z.ZodUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"cancelled">;
    }, "strip", z.ZodTypeAny, {
        outcome: "cancelled";
    }, {
        outcome: "cancelled";
    }>, z.ZodObject<{
        optionId: z.ZodString;
        outcome: z.ZodLiteral<"selected">;
    }, "strip", z.ZodTypeAny, {
        optionId: string;
        outcome: "selected";
    }, {
        optionId: string;
        outcome: "selected";
    }>]>;
}, "strip", z.ZodTypeAny, {
    outcome: {
        outcome: "cancelled";
    } | {
        optionId: string;
        outcome: "selected";
    };
}, {
    outcome: {
        outcome: "cancelled";
    } | {
        optionId: string;
        outcome: "selected";
    };
}>, z.ZodObject<{
    terminalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    terminalId: string;
}, {
    terminalId: string;
}>, z.ZodObject<{
    exitStatus: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        exitCode: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        signal: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    }, {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    }>>>;
    output: z.ZodString;
    truncated: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    output: string;
    truncated: boolean;
    exitStatus?: {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    } | null | undefined;
}, {
    output: string;
    truncated: boolean;
    exitStatus?: {
        exitCode?: number | null | undefined;
        signal?: string | null | undefined;
    } | null | undefined;
}>, z.ZodNull, z.ZodObject<{
    exitCode: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    signal: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    exitCode?: number | null | undefined;
    signal?: string | null | undefined;
}, {
    exitCode?: number | null | undefined;
    signal?: string | null | undefined;
}>]>, z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>, z.ZodUnion<[z.ZodObject<{
    clientCapabilities: z.ZodOptional<z.ZodObject<{
        fs: z.ZodOptional<z.ZodObject<{
            readTextFile: z.ZodOptional<z.ZodBoolean>;
            writeTextFile: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        }, {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        }>>;
        terminal: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    }, {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    }>>;
    protocolVersion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    protocolVersion: number;
    clientCapabilities?: {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    } | undefined;
}, {
    protocolVersion: number;
    clientCapabilities?: {
        fs?: {
            readTextFile?: boolean | undefined;
            writeTextFile?: boolean | undefined;
        } | undefined;
        terminal?: boolean | undefined;
    } | undefined;
}>, z.ZodObject<{
    methodId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    methodId: string;
}, {
    methodId: string;
}>, z.ZodObject<{
    cwd: z.ZodString;
    mcpServers: z.ZodArray<z.ZodObject<{
        args: z.ZodArray<z.ZodString, "many">;
        command: z.ZodString;
        env: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            name: string;
        }, {
            value: string;
            name: string;
        }>, "many">;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
}, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
}>, z.ZodObject<{
    cwd: z.ZodString;
    mcpServers: z.ZodArray<z.ZodObject<{
        args: z.ZodArray<z.ZodString, "many">;
        command: z.ZodString;
        env: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            name: string;
        }, {
            value: string;
            name: string;
        }>, "many">;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }, {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }>, "many">;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
    sessionId: string;
}, {
    cwd: string;
    mcpServers: {
        args: string[];
        command: string;
        env: {
            value: string;
            name: string;
        }[];
        name: string;
    }[];
    sessionId: string;
}>, z.ZodObject<{
    prompt: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        text: z.ZodString;
        type: z.ZodLiteral<"text">;
    }, "strip", z.ZodTypeAny, {
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        data: z.ZodString;
        mimeType: z.ZodString;
        type: z.ZodLiteral<"image">;
        uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    }, {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        data: z.ZodString;
        mimeType: z.ZodString;
        type: z.ZodLiteral<"audio">;
    }, "strip", z.ZodTypeAny, {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        name: z.ZodString;
        size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        type: z.ZodLiteral<"resource_link">;
        uri: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    }, {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    }>, z.ZodObject<{
        annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
            lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }, {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        }>>>;
        resource: z.ZodUnion<[z.ZodObject<{
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            text: z.ZodString;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        }, {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        }>, z.ZodObject<{
            blob: z.ZodString;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        }, {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        }>]>;
        type: z.ZodLiteral<"resource">;
    }, "strip", z.ZodTypeAny, {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }, {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    }>]>, "many">;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    prompt: ({
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    } | {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    } | {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    })[];
}, {
    sessionId: string;
    prompt: ({
        type: "text";
        text: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "image";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        uri?: string | null | undefined;
    } | {
        type: "audio";
        data: string;
        mimeType: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    } | {
        type: "resource_link";
        name: string;
        uri: string;
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
        mimeType?: string | null | undefined;
        description?: string | null | undefined;
        size?: number | null | undefined;
        title?: string | null | undefined;
    } | {
        type: "resource";
        resource: {
            text: string;
            uri: string;
            mimeType?: string | null | undefined;
        } | {
            uri: string;
            blob: string;
            mimeType?: string | null | undefined;
        };
        annotations?: {
            audience?: ("assistant" | "user")[] | null | undefined;
            lastModified?: string | null | undefined;
            priority?: number | null | undefined;
        } | null | undefined;
    })[];
}>]>, z.ZodUnion<[z.ZodObject<{
    agentCapabilities: z.ZodOptional<z.ZodObject<{
        loadSession: z.ZodOptional<z.ZodBoolean>;
        promptCapabilities: z.ZodOptional<z.ZodObject<{
            audio: z.ZodOptional<z.ZodBoolean>;
            embeddedContext: z.ZodOptional<z.ZodBoolean>;
            image: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        }, {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    }, {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    }>>;
    authMethods: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        description?: string | null | undefined;
    }, {
        id: string;
        name: string;
        description?: string | null | undefined;
    }>, "many">>;
    protocolVersion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    protocolVersion: number;
    agentCapabilities?: {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    } | undefined;
    authMethods?: {
        id: string;
        name: string;
        description?: string | null | undefined;
    }[] | undefined;
}, {
    protocolVersion: number;
    agentCapabilities?: {
        loadSession?: boolean | undefined;
        promptCapabilities?: {
            image?: boolean | undefined;
            audio?: boolean | undefined;
            embeddedContext?: boolean | undefined;
        } | undefined;
    } | undefined;
    authMethods?: {
        id: string;
        name: string;
        description?: string | null | undefined;
    }[] | undefined;
}>, z.ZodNull, z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>, z.ZodNull, z.ZodObject<{
    stopReason: z.ZodUnion<[z.ZodLiteral<"end_turn">, z.ZodLiteral<"max_tokens">, z.ZodLiteral<"max_turn_requests">, z.ZodLiteral<"refusal">, z.ZodLiteral<"cancelled">]>;
}, "strip", z.ZodTypeAny, {
    stopReason: "cancelled" | "end_turn" | "max_tokens" | "max_turn_requests" | "refusal";
}, {
    stopReason: "cancelled" | "end_turn" | "max_tokens" | "max_turn_requests" | "refusal";
}>]>, z.ZodObject<{
    sessionId: z.ZodString;
    update: z.ZodUnion<[z.ZodObject<{
        content: z.ZodUnion<[z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            text: z.ZodString;
            type: z.ZodLiteral<"text">;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"image">;
            uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"audio">;
        }, "strip", z.ZodTypeAny, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            name: z.ZodString;
            size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            type: z.ZodLiteral<"resource_link">;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            resource: z.ZodUnion<[z.ZodObject<{
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                text: z.ZodString;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }>, z.ZodObject<{
                blob: z.ZodString;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }>]>;
            type: z.ZodLiteral<"resource">;
        }, "strip", z.ZodTypeAny, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>]>;
        sessionUpdate: z.ZodLiteral<"user_message_chunk">;
    }, "strip", z.ZodTypeAny, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    }, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    }>, z.ZodObject<{
        content: z.ZodUnion<[z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            text: z.ZodString;
            type: z.ZodLiteral<"text">;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"image">;
            uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"audio">;
        }, "strip", z.ZodTypeAny, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            name: z.ZodString;
            size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            type: z.ZodLiteral<"resource_link">;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            resource: z.ZodUnion<[z.ZodObject<{
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                text: z.ZodString;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }>, z.ZodObject<{
                blob: z.ZodString;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }>]>;
            type: z.ZodLiteral<"resource">;
        }, "strip", z.ZodTypeAny, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>]>;
        sessionUpdate: z.ZodLiteral<"agent_message_chunk">;
    }, "strip", z.ZodTypeAny, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    }, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    }>, z.ZodObject<{
        content: z.ZodUnion<[z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            text: z.ZodString;
            type: z.ZodLiteral<"text">;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"image">;
            uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }, {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            type: z.ZodLiteral<"audio">;
        }, "strip", z.ZodTypeAny, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            name: z.ZodString;
            size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            type: z.ZodLiteral<"resource_link">;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }, {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        }>, z.ZodObject<{
            annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }, {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            }>>>;
            resource: z.ZodUnion<[z.ZodObject<{
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                text: z.ZodString;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }, {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            }>, z.ZodObject<{
                blob: z.ZodString;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }, {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            }>]>;
            type: z.ZodLiteral<"resource">;
        }, "strip", z.ZodTypeAny, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }, {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        }>]>;
        sessionUpdate: z.ZodLiteral<"agent_thought_chunk">;
    }, "strip", z.ZodTypeAny, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    }, {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    }>, z.ZodObject<{
        content: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            content: z.ZodUnion<[z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                text: z.ZodString;
                type: z.ZodLiteral<"text">;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"image">;
                uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"audio">;
            }, "strip", z.ZodTypeAny, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                name: z.ZodString;
                size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                type: z.ZodLiteral<"resource_link">;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                resource: z.ZodUnion<[z.ZodObject<{
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    text: z.ZodString;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }>, z.ZodObject<{
                    blob: z.ZodString;
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }>]>;
                type: z.ZodLiteral<"resource">;
            }, "strip", z.ZodTypeAny, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>]>;
            type: z.ZodLiteral<"content">;
        }, "strip", z.ZodTypeAny, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }>, z.ZodObject<{
            newText: z.ZodString;
            oldText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            path: z.ZodString;
            type: z.ZodLiteral<"diff">;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }>, z.ZodObject<{
            terminalId: z.ZodString;
            type: z.ZodLiteral<"terminal">;
        }, "strip", z.ZodTypeAny, {
            type: "terminal";
            terminalId: string;
        }, {
            type: "terminal";
            terminalId: string;
        }>]>, "many">>;
        kind: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"read">, z.ZodLiteral<"edit">, z.ZodLiteral<"delete">, z.ZodLiteral<"move">, z.ZodLiteral<"search">, z.ZodLiteral<"execute">, z.ZodLiteral<"think">, z.ZodLiteral<"fetch">, z.ZodLiteral<"other">]>>;
        locations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            line?: number | null | undefined;
        }, {
            path: string;
            line?: number | null | undefined;
        }>, "many">>;
        rawInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        rawOutput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        sessionUpdate: z.ZodLiteral<"tool_call">;
        status: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">, z.ZodLiteral<"failed">]>>;
        title: z.ZodString;
        toolCallId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }, {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }>, z.ZodObject<{
        content: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            content: z.ZodUnion<[z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                text: z.ZodString;
                type: z.ZodLiteral<"text">;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"image">;
                uri: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }, {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                data: z.ZodString;
                mimeType: z.ZodString;
                type: z.ZodLiteral<"audio">;
            }, "strip", z.ZodTypeAny, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                name: z.ZodString;
                size: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                type: z.ZodLiteral<"resource_link">;
                uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }, {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            }>, z.ZodObject<{
                annotations: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    audience: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>, "many">>>;
                    lastModified: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    priority: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                }, "strip", z.ZodTypeAny, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }, {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                }>>>;
                resource: z.ZodUnion<[z.ZodObject<{
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    text: z.ZodString;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }, {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                }>, z.ZodObject<{
                    blob: z.ZodString;
                    mimeType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                    uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }, {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                }>]>;
                type: z.ZodLiteral<"resource">;
            }, "strip", z.ZodTypeAny, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }, {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            }>]>;
            type: z.ZodLiteral<"content">;
        }, "strip", z.ZodTypeAny, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }, {
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        }>, z.ZodObject<{
            newText: z.ZodString;
            oldText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            path: z.ZodString;
            type: z.ZodLiteral<"diff">;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }, {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        }>, z.ZodObject<{
            terminalId: z.ZodString;
            type: z.ZodLiteral<"terminal">;
        }, "strip", z.ZodTypeAny, {
            type: "terminal";
            terminalId: string;
        }, {
            type: "terminal";
            terminalId: string;
        }>]>, "many">>>;
        kind: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"read">, z.ZodLiteral<"edit">, z.ZodLiteral<"delete">, z.ZodLiteral<"move">, z.ZodLiteral<"search">, z.ZodLiteral<"execute">, z.ZodLiteral<"think">, z.ZodLiteral<"fetch">, z.ZodLiteral<"other">]>>>;
        locations: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
            line: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            line?: number | null | undefined;
        }, {
            path: string;
            line?: number | null | undefined;
        }>, "many">>>;
        rawInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        rawOutput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        sessionUpdate: z.ZodLiteral<"tool_call_update">;
        status: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">, z.ZodLiteral<"failed">]>>>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        toolCallId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }, {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    }>, z.ZodObject<{
        entries: z.ZodArray<z.ZodObject<{
            content: z.ZodString;
            priority: z.ZodUnion<[z.ZodLiteral<"high">, z.ZodLiteral<"medium">, z.ZodLiteral<"low">]>;
            status: z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"in_progress">, z.ZodLiteral<"completed">]>;
        }, "strip", z.ZodTypeAny, {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }, {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }>, "many">;
        sessionUpdate: z.ZodLiteral<"plan">;
    }, "strip", z.ZodTypeAny, {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    }, {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    }>]>;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    update: {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    } | {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    };
}, {
    sessionId: string;
    update: {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "user_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_message_chunk";
    } | {
        content: {
            type: "text";
            text: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            uri?: string | null | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        } | {
            type: "resource_link";
            name: string;
            uri: string;
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
            mimeType?: string | null | undefined;
            description?: string | null | undefined;
            size?: number | null | undefined;
            title?: string | null | undefined;
        } | {
            type: "resource";
            resource: {
                text: string;
                uri: string;
                mimeType?: string | null | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | null | undefined;
            };
            annotations?: {
                audience?: ("assistant" | "user")[] | null | undefined;
                lastModified?: string | null | undefined;
                priority?: number | null | undefined;
            } | null | undefined;
        };
        sessionUpdate: "agent_thought_chunk";
    } | {
        title: string;
        toolCallId: string;
        sessionUpdate: "tool_call";
        status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        toolCallId: string;
        sessionUpdate: "tool_call_update";
        status?: "pending" | "in_progress" | "completed" | "failed" | null | undefined;
        title?: string | null | undefined;
        content?: ({
            type: "content";
            content: {
                type: "text";
                text: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                uri?: string | null | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
                mimeType?: string | null | undefined;
                description?: string | null | undefined;
                size?: number | null | undefined;
                title?: string | null | undefined;
            } | {
                type: "resource";
                resource: {
                    text: string;
                    uri: string;
                    mimeType?: string | null | undefined;
                } | {
                    uri: string;
                    blob: string;
                    mimeType?: string | null | undefined;
                };
                annotations?: {
                    audience?: ("assistant" | "user")[] | null | undefined;
                    lastModified?: string | null | undefined;
                    priority?: number | null | undefined;
                } | null | undefined;
            };
        } | {
            path: string;
            type: "diff";
            newText: string;
            oldText?: string | null | undefined;
        } | {
            type: "terminal";
            terminalId: string;
        })[] | null | undefined;
        kind?: "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "other" | null | undefined;
        locations?: {
            path: string;
            line?: number | null | undefined;
        }[] | null | undefined;
        rawInput?: Record<string, unknown> | undefined;
        rawOutput?: Record<string, unknown> | undefined;
    } | {
        entries: {
            status: "pending" | "in_progress" | "completed";
            priority: "high" | "medium" | "low";
            content: string;
        }[];
        sessionUpdate: "plan";
    };
}>]>;

export { AGENT_METHODS, type AgentCapabilities, type AgentClientProtocol, type AgentNotification, type AgentRequest, type AgentResponse, type Annotations, type AuthMethod, type AuthenticateRequest, type AuthenticateResponse, type BlobResourceContents, CLIENT_METHODS, type CancelNotification, type ClientCapabilities, type ClientNotification, type ClientRequest, type ClientResponse, type ContentBlock, type CreateTerminalRequest, type CreateTerminalResponse, type EmbeddedResourceResource, type EnvVariable, type FileSystemCapability, type InitializeRequest, type InitializeResponse, type LoadSessionRequest, type LoadSessionResponse, type McpServer, type NewSessionRequest, type NewSessionResponse, PROTOCOL_VERSION, type PermissionOption, type PlanEntry, type PromptCapabilities, type PromptRequest, type PromptResponse, type ReadTextFileRequest, type ReadTextFileResponse, type ReleaseTerminalRequest, type ReleaseTerminalResponse, type RequestPermissionRequest, type RequestPermissionResponse, type Role, type SessionId, type SessionNotification, type TerminalExitStatus, type TerminalOutputRequest, type TerminalOutputResponse, type TextResourceContents, type ToolCallContent, type ToolCallLocation, type ToolCallStatus, type ToolCallUpdate, type ToolKind, type WaitForTerminalExitRequest, type WaitForTerminalExitResponse, type WriteTextFileRequest, type WriteTextFileResponse, agentCapabilitiesSchema, agentClientProtocolSchema, agentNotificationSchema, agentRequestSchema, agentResponseSchema, annotationsSchema, authMethodSchema, authenticateRequestSchema, authenticateResponseSchema, blobResourceContentsSchema, cancelNotificationSchema, clientCapabilitiesSchema, clientNotificationSchema, clientRequestSchema, clientResponseSchema, contentBlockSchema, createTerminalRequestSchema, createTerminalResponseSchema, embeddedResourceResourceSchema, envVariableSchema, fileSystemCapabilitySchema, initializeRequestSchema, initializeResponseSchema, loadSessionRequestSchema, loadSessionResponseSchema, mcpServerSchema, newSessionRequestSchema, newSessionResponseSchema, permissionOptionSchema, planEntrySchema, promptCapabilitiesSchema, promptRequestSchema, promptResponseSchema, readTextFileRequestSchema, readTextFileResponseSchema, releaseTerminalRequestSchema, releaseTerminalResponseSchema, requestPermissionRequestSchema, requestPermissionResponseSchema, roleSchema, sessionIdSchema, sessionNotificationSchema, terminalExitStatusSchema, terminalOutputRequestSchema, terminalOutputResponseSchema, textResourceContentsSchema, toolCallContentSchema, toolCallLocationSchema, toolCallStatusSchema, toolCallUpdateSchema, toolKindSchema, waitForTerminalExitRequestSchema, waitForTerminalExitResponseSchema, writeTextFileRequestSchema, writeTextFileResponseSchema };
