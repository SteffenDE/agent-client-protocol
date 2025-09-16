import { InitializeRequest, InitializeResponse, NewSessionRequest, NewSessionResponse, LoadSessionRequest, AuthenticateRequest, PromptRequest, PromptResponse, CancelNotification, SessionNotification, RequestPermissionRequest, RequestPermissionResponse, ReadTextFileRequest, ReadTextFileResponse, WriteTextFileRequest, WriteTextFileResponse, CreateTerminalRequest, TerminalOutputResponse, WaitForTerminalExitResponse, CreateTerminalResponse, TerminalOutputRequest, ReleaseTerminalRequest, WaitForTerminalExitRequest } from './schema.cjs';
export { AGENT_METHODS, AgentCapabilities, AgentClientProtocol, AgentNotification, AgentRequest, AgentResponse, Annotations, AuthMethod, AuthenticateResponse, BlobResourceContents, CLIENT_METHODS, ClientCapabilities, ClientNotification, ClientRequest, ClientResponse, ContentBlock, EmbeddedResourceResource, EnvVariable, FileSystemCapability, LoadSessionResponse, McpServer, PROTOCOL_VERSION, PermissionOption, PlanEntry, PromptCapabilities, ReleaseTerminalResponse, Role, SessionId, TerminalExitStatus, TextResourceContents, ToolCallContent, ToolCallLocation, ToolCallStatus, ToolCallUpdate, ToolKind, agentCapabilitiesSchema, agentClientProtocolSchema, agentNotificationSchema, agentRequestSchema, agentResponseSchema, annotationsSchema, authMethodSchema, authenticateRequestSchema, authenticateResponseSchema, blobResourceContentsSchema, cancelNotificationSchema, clientCapabilitiesSchema, clientNotificationSchema, clientRequestSchema, clientResponseSchema, contentBlockSchema, createTerminalRequestSchema, createTerminalResponseSchema, embeddedResourceResourceSchema, envVariableSchema, fileSystemCapabilitySchema, initializeRequestSchema, initializeResponseSchema, loadSessionRequestSchema, loadSessionResponseSchema, mcpServerSchema, newSessionRequestSchema, newSessionResponseSchema, permissionOptionSchema, planEntrySchema, promptCapabilitiesSchema, promptRequestSchema, promptResponseSchema, readTextFileRequestSchema, readTextFileResponseSchema, releaseTerminalRequestSchema, releaseTerminalResponseSchema, requestPermissionRequestSchema, requestPermissionResponseSchema, roleSchema, sessionIdSchema, sessionNotificationSchema, terminalExitStatusSchema, terminalOutputRequestSchema, terminalOutputResponseSchema, textResourceContentsSchema, toolCallContentSchema, toolCallLocationSchema, toolCallStatusSchema, toolCallUpdateSchema, toolKindSchema, waitForTerminalExitRequestSchema, waitForTerminalExitResponseSchema, writeTextFileRequestSchema, writeTextFileResponseSchema } from './schema.cjs';
import { WritableStream, ReadableStream } from 'node:stream/web';
import 'zod';

/**
 * An agent-side connection to a client.
 *
 * This class provides the agent's view of an ACP connection, allowing
 * agents to communicate with clients. It implements the {@link Client} interface
 * to provide methods for requesting permissions, accessing the file system,
 * and sending session updates.
 *
 * See protocol docs: [Agent](https://agentclientprotocol.com/protocol/overview#agent)
 */
declare class AgentSideConnection {
    #private;
    /**
     * Creates a new agent-side connection to a client.
     *
     * This establishes the communication channel from the agent's perspective
     * following the ACP specification.
     *
     * @param toAgent - A function that creates an Agent handler to process incoming client requests
     * @param input - The stream for sending data to the client (typically stdout)
     * @param output - The stream for receiving data from the client (typically stdin)
     *
     * See protocol docs: [Communication Model](https://agentclientprotocol.com/protocol/overview#communication-model)
     */
    constructor(toAgent: (conn: AgentSideConnection) => Agent, input: WritableStream<Uint8Array>, output: ReadableStream<Uint8Array>);
    /**
     * Handles session update notifications from the agent.
     *
     * This is a notification endpoint (no response expected) that sends
     * real-time updates about session progress, including message chunks,
     * tool calls, and execution plans.
     *
     * Note: Clients SHOULD continue accepting tool call updates even after
     * sending a `session/cancel` notification, as the agent may send final
     * updates before responding with the cancelled stop reason.
     *
     * See protocol docs: [Agent Reports Output](https://agentclientprotocol.com/protocol/prompt-turn#3-agent-reports-output)
     */
    sessionUpdate(params: SessionNotification): Promise<void>;
    /**
     * Requests permission from the user for a tool call operation.
     *
     * Called by the agent when it needs user authorization before executing
     * a potentially sensitive operation. The client should present the options
     * to the user and return their decision.
     *
     * If the client cancels the prompt turn via `session/cancel`, it MUST
     * respond to this request with `RequestPermissionOutcome::Cancelled`.
     *
     * See protocol docs: [Requesting Permission](https://agentclientprotocol.com/protocol/tool-calls#requesting-permission)
     */
    requestPermission(params: RequestPermissionRequest): Promise<RequestPermissionResponse>;
    /**
     * Reads content from a text file in the client's file system.
     *
     * Only available if the client advertises the `fs.readTextFile` capability.
     * Allows the agent to access file contents within the client's environment.
     *
     * See protocol docs: [Client](https://agentclientprotocol.com/protocol/overview#client)
     */
    readTextFile(params: ReadTextFileRequest): Promise<ReadTextFileResponse>;
    /**
     * Writes content to a text file in the client's file system.
     *
     * Only available if the client advertises the `fs.writeTextFile` capability.
     * Allows the agent to create or modify files within the client's environment.
     *
     * See protocol docs: [Client](https://agentclientprotocol.com/protocol/overview#client)
     */
    writeTextFile(params: WriteTextFileRequest): Promise<WriteTextFileResponse>;
    /**
     *  @internal **UNSTABLE**
     *
     * This method is not part of the spec, and may be removed or changed at any point.
     */
    createTerminal(params: CreateTerminalRequest): Promise<TerminalHandle>;
}
declare class TerminalHandle {
    #private;
    id: string;
    constructor(id: string, sessionId: string, conn: Connection);
    currentOutput(): Promise<TerminalOutputResponse>;
    waitForExit(): Promise<WaitForTerminalExitResponse>;
    release(): Promise<void>;
    [Symbol.asyncDispose](): Promise<void>;
}
/**
 * A client-side connection to an agent.
 *
 * This class provides the client's view of an ACP connection, allowing
 * clients (such as code editors) to communicate with agents. It implements
 * the {@link Agent} interface to provide methods for initializing sessions, sending
 * prompts, and managing the agent lifecycle.
 *
 * See protocol docs: [Client](https://agentclientprotocol.com/protocol/overview#client)
 */
declare class ClientSideConnection implements Agent {
    #private;
    /**
     * Creates a new client-side connection to an agent.
     *
     * This establishes the communication channel between a client and agent
     * following the ACP specification.
     *
     * @param toClient - A function that creates a Client handler to process incoming agent requests
     * @param input - The stream for sending data to the agent (typically stdout)
     * @param output - The stream for receiving data from the agent (typically stdin)
     *
     * See protocol docs: [Communication Model](https://agentclientprotocol.com/protocol/overview#communication-model)
     */
    constructor(toClient: (agent: Agent) => Client, input: WritableStream<Uint8Array>, output: ReadableStream<Uint8Array>);
    /**
     * Establishes the connection with a client and negotiates protocol capabilities.
     *
     * This method is called once at the beginning of the connection to:
     * - Negotiate the protocol version to use
     * - Exchange capability information between client and agent
     * - Determine available authentication methods
     *
     * The agent should respond with its supported protocol version and capabilities.
     *
     * See protocol docs: [Initialization](https://agentclientprotocol.com/protocol/initialization)
     */
    initialize(params: InitializeRequest): Promise<InitializeResponse>;
    /**
     * Creates a new conversation session with the agent.
     *
     * Sessions represent independent conversation contexts with their own history and state.
     *
     * The agent should:
     * - Create a new session context
     * - Connect to any specified MCP servers
     * - Return a unique session ID for future requests
     *
     * May return an `auth_required` error if the agent requires authentication.
     *
     * See protocol docs: [Session Setup](https://agentclientprotocol.com/protocol/session-setup)
     */
    newSession(params: NewSessionRequest): Promise<NewSessionResponse>;
    /**
     * Loads an existing session to resume a previous conversation.
     *
     * This method is only available if the agent advertises the `loadSession` capability.
     *
     * The agent should:
     * - Restore the session context and conversation history
     * - Connect to the specified MCP servers
     * - Stream the entire conversation history back to the client via notifications
     *
     * See protocol docs: [Loading Sessions](https://agentclientprotocol.com/protocol/session-setup#loading-sessions)
     */
    loadSession(params: LoadSessionRequest): Promise<void>;
    /**
     * Authenticates the client using the specified authentication method.
     *
     * Called when the agent requires authentication before allowing session creation.
     * The client provides the authentication method ID that was advertised during initialization.
     *
     * After successful authentication, the client can proceed to create sessions with
     * `newSession` without receiving an `auth_required` error.
     *
     * See protocol docs: [Initialization](https://agentclientprotocol.com/protocol/initialization)
     */
    authenticate(params: AuthenticateRequest): Promise<void>;
    /**
     * Processes a user prompt within a session.
     *
     * This method handles the whole lifecycle of a prompt:
     * - Receives user messages with optional context (files, images, etc.)
     * - Processes the prompt using language models
     * - Reports language model content and tool calls to the Clients
     * - Requests permission to run tools
     * - Executes any requested tool calls
     * - Returns when the turn is complete with a stop reason
     *
     * See protocol docs: [Prompt Turn](https://agentclientprotocol.com/protocol/prompt-turn)
     */
    prompt(params: PromptRequest): Promise<PromptResponse>;
    /**
     * Cancels ongoing operations for a session.
     *
     * This is a notification sent by the client to cancel an ongoing prompt turn.
     *
     * Upon receiving this notification, the Agent SHOULD:
     * - Stop all language model requests as soon as possible
     * - Abort all tool call invocations in progress
     * - Send any pending `session/update` notifications
     * - Respond to the original `session/prompt` request with `StopReason::Cancelled`
     *
     * See protocol docs: [Cancellation](https://agentclientprotocol.com/protocol/prompt-turn#cancellation)
     */
    cancel(params: CancelNotification): Promise<void>;
}
type Result<T> = {
    result: T;
} | {
    error: ErrorResponse;
};
type ErrorResponse = {
    code: number;
    message: string;
    data?: unknown;
};
type MethodHandler = (method: string, params: unknown) => Promise<unknown>;
declare class Connection {
    #private;
    constructor(handler: MethodHandler, peerInput: WritableStream<Uint8Array>, peerOutput: ReadableStream<Uint8Array>);
    sendRequest<Req, Resp>(method: string, params?: Req): Promise<Resp>;
    sendNotification<N>(method: string, params?: N): Promise<void>;
}
/**
 * JSON-RPC error object.
 *
 * Represents an error that occurred during method execution, following the
 * JSON-RPC 2.0 error object specification with optional additional data.
 *
 * See protocol docs: [JSON-RPC Error Object](https://www.jsonrpc.org/specification#error_object)
 */
declare class RequestError extends Error {
    code: number;
    data?: unknown;
    constructor(code: number, message: string, data?: unknown);
    /**
     * Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.
     */
    static parseError(data?: object): RequestError;
    /**
     * The JSON sent is not a valid Request object.
     */
    static invalidRequest(data?: object): RequestError;
    /**
     * The method does not exist / is not available.
     */
    static methodNotFound(method: string): RequestError;
    /**
     * Invalid method parameter(s).
     */
    static invalidParams(data?: object): RequestError;
    /**
     * Internal JSON-RPC error.
     */
    static internalError(data?: object): RequestError;
    /**
     * Authentication required.
     */
    static authRequired(data?: object): RequestError;
    toResult<T>(): Result<T>;
    toErrorResponse(): ErrorResponse;
}
/**
 * The Client interface defines the interface that ACP-compliant clients must implement.
 *
 * Clients are typically code editors (IDEs, text editors) that provide the interface
 * between users and AI agents. They manage the environment, handle user interactions,
 * and control access to resources.
 */
interface Client {
    /**
     * Requests permission from the user for a tool call operation.
     *
     * Called by the agent when it needs user authorization before executing
     * a potentially sensitive operation. The client should present the options
     * to the user and return their decision.
     *
     * If the client cancels the prompt turn via `session/cancel`, it MUST
     * respond to this request with `RequestPermissionOutcome::Cancelled`.
     *
     * See protocol docs: [Requesting Permission](https://agentclientprotocol.com/protocol/tool-calls#requesting-permission)
     */
    requestPermission(params: RequestPermissionRequest): Promise<RequestPermissionResponse>;
    /**
     * Handles session update notifications from the agent.
     *
     * This is a notification endpoint (no response expected) that receives
     * real-time updates about session progress, including message chunks,
     * tool calls, and execution plans.
     *
     * Note: Clients SHOULD continue accepting tool call updates even after
     * sending a `session/cancel` notification, as the agent may send final
     * updates before responding with the cancelled stop reason.
     *
     * See protocol docs: [Agent Reports Output](https://agentclientprotocol.com/protocol/prompt-turn#3-agent-reports-output)
     */
    sessionUpdate(params: SessionNotification): Promise<void>;
    /**
     * Writes content to a text file in the client's file system.
     *
     * Only available if the client advertises the `fs.writeTextFile` capability.
     * Allows the agent to create or modify files within the client's environment.
     *
     * See protocol docs: [Client](https://agentclientprotocol.com/protocol/overview#client)
     */
    writeTextFile(params: WriteTextFileRequest): Promise<WriteTextFileResponse>;
    /**
     * Reads content from a text file in the client's file system.
     *
     * Only available if the client advertises the `fs.readTextFile` capability.
     * Allows the agent to access file contents within the client's environment.
     *
     * See protocol docs: [Client](https://agentclientprotocol.com/protocol/overview#client)
     */
    readTextFile(params: ReadTextFileRequest): Promise<ReadTextFileResponse>;
    /**
     *  @internal **UNSTABLE**
     *
     * This method is not part of the spec, and may be removed or changed at any point.
     */
    createTerminal?(params: CreateTerminalRequest): Promise<CreateTerminalResponse>;
    /**
     *  @internal **UNSTABLE**
     *
     * This method is not part of the spec, and may be removed or changed at any point.
     */
    terminalOutput?(params: TerminalOutputRequest): Promise<TerminalOutputResponse>;
    /**
     *  @internal **UNSTABLE**
     *
     * This method is not part of the spec, and may be removed or changed at any point.
     */
    releaseTerminal?(params: ReleaseTerminalRequest): Promise<void>;
    /**
     *  @internal **UNSTABLE**
     *
     * This method is not part of the spec, and may be removed or changed at any point.
     */
    waitForTerminalExit?(params: WaitForTerminalExitRequest): Promise<WaitForTerminalExitResponse>;
}
/**
 * The Agent interface defines the interface that all ACP-compliant agents must implement.
 *
 * Agents are programs that use generative AI to autonomously modify code. They handle
 * requests from clients and execute tasks using language models and tools.
 */
interface Agent {
    /**
     * Establishes the connection with a client and negotiates protocol capabilities.
     *
     * This method is called once at the beginning of the connection to:
     * - Negotiate the protocol version to use
     * - Exchange capability information between client and agent
     * - Determine available authentication methods
     *
     * The agent should respond with its supported protocol version and capabilities.
     *
     * See protocol docs: [Initialization](https://agentclientprotocol.com/protocol/initialization)
     */
    initialize(params: InitializeRequest): Promise<InitializeResponse>;
    /**
     * Creates a new conversation session with the agent.
     *
     * Sessions represent independent conversation contexts with their own history and state.
     *
     * The agent should:
     * - Create a new session context
     * - Connect to any specified MCP servers
     * - Return a unique session ID for future requests
     *
     * May return an `auth_required` error if the agent requires authentication.
     *
     * See protocol docs: [Session Setup](https://agentclientprotocol.com/protocol/session-setup)
     */
    newSession(params: NewSessionRequest): Promise<NewSessionResponse>;
    /**
     * Loads an existing session to resume a previous conversation.
     *
     * This method is only available if the agent advertises the `loadSession` capability.
     *
     * The agent should:
     * - Restore the session context and conversation history
     * - Connect to the specified MCP servers
     * - Stream the entire conversation history back to the client via notifications
     *
     * See protocol docs: [Loading Sessions](https://agentclientprotocol.com/protocol/session-setup#loading-sessions)
     */
    loadSession?(params: LoadSessionRequest): Promise<void>;
    /**
     * Authenticates the client using the specified authentication method.
     *
     * Called when the agent requires authentication before allowing session creation.
     * The client provides the authentication method ID that was advertised during initialization.
     *
     * After successful authentication, the client can proceed to create sessions with
     * `newSession` without receiving an `auth_required` error.
     *
     * See protocol docs: [Initialization](https://agentclientprotocol.com/protocol/initialization)
     */
    authenticate(params: AuthenticateRequest): Promise<void>;
    /**
     * Processes a user prompt within a session.
     *
     * This method handles the whole lifecycle of a prompt:
     * - Receives user messages with optional context (files, images, etc.)
     * - Processes the prompt using language models
     * - Reports language model content and tool calls to the Clients
     * - Requests permission to run tools
     * - Executes any requested tool calls
     * - Returns when the turn is complete with a stop reason
     *
     * See protocol docs: [Prompt Turn](https://agentclientprotocol.com/protocol/prompt-turn)
     */
    prompt(params: PromptRequest): Promise<PromptResponse>;
    /**
     * Cancels ongoing operations for a session.
     *
     * This is a notification sent by the client to cancel an ongoing prompt turn.
     *
     * Upon receiving this notification, the Agent SHOULD:
     * - Stop all language model requests as soon as possible
     * - Abort all tool call invocations in progress
     * - Send any pending `session/update` notifications
     * - Respond to the original `session/prompt` request with `StopReason::Cancelled`
     *
     * See protocol docs: [Cancellation](https://agentclientprotocol.com/protocol/prompt-turn#cancellation)
     */
    cancel(params: CancelNotification): Promise<void>;
}

export { type Agent, AgentSideConnection, AuthenticateRequest, CancelNotification, type Client, ClientSideConnection, CreateTerminalRequest, CreateTerminalResponse, InitializeRequest, InitializeResponse, LoadSessionRequest, NewSessionRequest, NewSessionResponse, PromptRequest, PromptResponse, ReadTextFileRequest, ReadTextFileResponse, ReleaseTerminalRequest, RequestError, RequestPermissionRequest, RequestPermissionResponse, SessionNotification, TerminalHandle, TerminalOutputRequest, TerminalOutputResponse, WaitForTerminalExitRequest, WaitForTerminalExitResponse, WriteTextFileRequest, WriteTextFileResponse };
