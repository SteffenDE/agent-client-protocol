import { InitializeRequest, InitializeResponse, NewSessionRequest, NewSessionResponse, LoadSessionRequest, LoadSessionResponse, SetSessionModeRequest, SetSessionModeResponse, AuthenticateRequest, AuthenticateResponse, PromptRequest, PromptResponse, CancelNotification, SessionNotification, RequestPermissionRequest, RequestPermissionResponse, ReadTextFileRequest, ReadTextFileResponse, WriteTextFileRequest, WriteTextFileResponse, CreateTerminalRequest, TerminalOutputResponse, WaitForTerminalExitResponse, KillTerminalResponse, ReleaseTerminalResponse, CreateTerminalResponse, TerminalOutputRequest, ReleaseTerminalRequest, WaitForTerminalExitRequest, KillTerminalCommandRequest } from './schema.cjs';
export { AGENT_METHODS, AgentCapabilities, AgentClientProtocol, AgentNotification, AgentRequest, AgentResponse, Annotations, AuthMethod, AvailableCommand, AvailableCommandInput, BlobResourceContents, CLIENT_METHODS, ClientCapabilities, ClientNotification, ClientRequest, ClientResponse, ContentBlock, EmbeddedResourceResource, EnvVariable, ExtMethodRequest, ExtMethodRequest1, ExtMethodResponse, ExtMethodResponse1, ExtNotification, ExtNotification1, FileSystemCapability, HttpHeader, McpCapabilities, McpServer, PROTOCOL_VERSION, PermissionOption, PlanEntry, PromptCapabilities, Role, SessionMode, SessionModeId, SessionModeState, Stdio, TerminalExitStatus, TextResourceContents, ToolCallContent, ToolCallLocation, ToolCallStatus, ToolCallUpdate, ToolKind, UnstructuredCommandInput, agentCapabilitiesSchema, agentClientProtocolSchema, agentNotificationSchema, agentRequestSchema, agentResponseSchema, annotationsSchema, authMethodSchema, authenticateRequestSchema, authenticateResponseSchema, availableCommandInputSchema, availableCommandSchema, blobResourceContentsSchema, cancelNotificationSchema, clientCapabilitiesSchema, clientNotificationSchema, clientRequestSchema, clientResponseSchema, contentBlockSchema, createTerminalRequestSchema, createTerminalResponseSchema, embeddedResourceResourceSchema, envVariableSchema, extMethodRequest1Schema, extMethodRequestSchema, extMethodResponse1Schema, extMethodResponseSchema, extNotification1Schema, extNotificationSchema, fileSystemCapabilitySchema, httpHeaderSchema, initializeRequestSchema, initializeResponseSchema, killTerminalCommandRequestSchema, killTerminalResponseSchema, loadSessionRequestSchema, loadSessionResponseSchema, mcpCapabilitiesSchema, mcpServerSchema, newSessionRequestSchema, newSessionResponseSchema, permissionOptionSchema, planEntrySchema, promptCapabilitiesSchema, promptRequestSchema, promptResponseSchema, readTextFileRequestSchema, readTextFileResponseSchema, releaseTerminalRequestSchema, releaseTerminalResponseSchema, requestPermissionRequestSchema, requestPermissionResponseSchema, roleSchema, sessionModeIdSchema, sessionModeSchema, sessionModeStateSchema, sessionNotificationSchema, setSessionModeRequestSchema, setSessionModeResponseSchema, stdioSchema, terminalExitStatusSchema, terminalOutputRequestSchema, terminalOutputResponseSchema, textResourceContentsSchema, toolCallContentSchema, toolCallLocationSchema, toolCallStatusSchema, toolCallUpdateSchema, toolKindSchema, unstructuredCommandInputSchema, waitForTerminalExitRequestSchema, waitForTerminalExitResponseSchema, writeTextFileRequestSchema, writeTextFileResponseSchema } from './schema.cjs';
import 'zod';

/**
 * JSON-RPC 2.0 type definitions for internal use.
 */
type AnyMessage = AnyRequest | AnyResponse | AnyNotification;
type AnyRequest = {
    jsonrpc: "2.0";
    id: string | number;
    method: string;
    params?: unknown;
};
type AnyResponse = {
    jsonrpc: "2.0";
    id: string | number;
} & Result<unknown>;
type AnyNotification = {
    jsonrpc: "2.0";
    method: string;
    params?: unknown;
};
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
type RequestHandler = (method: string, params: unknown) => Promise<unknown>;
type NotificationHandler = (method: string, params: unknown) => Promise<void>;

/**
 * Stream interface for ACP connections.
 *
 * This type powers the bidirectional communication for an ACP connection,
 * providing readable and writable streams of messages.
 *
 * The most common way to create a Stream is using {@link ndJsonStream}.
 */
type Stream = {
    writable: WritableStream<AnyMessage>;
    readable: ReadableStream<AnyMessage>;
};
/**
 * Creates an ACP Stream from a pair of newline-delimited JSON streams.
 *
 * This is the typical way to handle ACP connections over stdio, converting
 * between AnyMessage objects and newline-delimited JSON.
 *
 * @param output - The writable stream to send encoded messages to
 * @param input - The readable stream to receive encoded messages from
 * @returns A Stream for bidirectional ACP communication
 */
declare function ndJsonStream(output: WritableStream<Uint8Array>, input: ReadableStream<Uint8Array>): Stream;

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
     * @param stream - The bidirectional message stream for communication. Typically created using
     *                 {@link ndJsonStream} for stdio-based connections.
     *
     * See protocol docs: [Communication Model](https://agentclientprotocol.com/protocol/overview#communication-model)
     */
    constructor(toAgent: (conn: AgentSideConnection) => Agent, stream: Stream);
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
     * Executes a command in a new terminal.
     *
     * Returns a `TerminalHandle` that can be used to get output, wait for exit,
     * kill the command, or release the terminal.
     *
     * The terminal can also be embedded in tool calls by using its ID in
     * `ToolCallContent` with type "terminal".
     *
     * @param params - The terminal creation parameters
     * @returns A handle to control and monitor the terminal
     */
    createTerminal(params: CreateTerminalRequest): Promise<TerminalHandle>;
    /**
     * Extension method
     *
     * Allows the Agent to send an arbitrary request that is not part of the ACP spec.
     */
    extMethod(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * Extension notification
     *
     * Allows the Agent to send an arbitrary notification that is not part of the ACP spec.
     */
    extNotification(method: string, params: Record<string, unknown>): Promise<void>;
}
/**
 * Handle for controlling and monitoring a terminal created via `createTerminal`.
 *
 * Provides methods to:
 * - Get current output without waiting
 * - Wait for command completion
 * - Kill the running command
 * - Release terminal resources
 *
 * **Important:** Always call `release()` when done with the terminal to free resources.

 * The terminal supports async disposal via `Symbol.asyncDispose` for automatic cleanup.

 * You can use `await using` to ensure the terminal is automatically released when it
 * goes out of scope.
 */
declare class TerminalHandle {
    #private;
    id: string;
    constructor(id: string, sessionId: string, conn: Connection);
    /**
     * Gets the current terminal output without waiting for the command to exit.
     */
    currentOutput(): Promise<TerminalOutputResponse>;
    /**
     * Waits for the terminal command to complete and returns its exit status.
     */
    waitForExit(): Promise<WaitForTerminalExitResponse>;
    /**
     * Kills the terminal command without releasing the terminal.
     *
     * The terminal remains valid after killing, allowing you to:
     * - Get the final output with `currentOutput()`
     * - Check the exit status
     * - Release the terminal when done
     *
     * Useful for implementing timeouts or cancellation.
     */
    kill(): Promise<KillTerminalResponse>;
    /**
     * Releases the terminal and frees all associated resources.
     *
     * If the command is still running, it will be killed.
     * After release, the terminal ID becomes invalid and cannot be used
     * with other terminal methods.
     *
     * Tool calls that already reference this terminal will continue to
     * display its output.
     *
     * **Important:** Always call this method when done with the terminal.
     */
    release(): Promise<ReleaseTerminalResponse | void>;
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
     * @param stream - The bidirectional message stream for communication. Typically created using
     *                 {@link ndJsonStream} for stdio-based connections.
     *
     * See protocol docs: [Communication Model](https://agentclientprotocol.com/protocol/overview#communication-model)
     */
    constructor(toClient: (agent: Agent) => Client, stream: Stream);
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
    loadSession(params: LoadSessionRequest): Promise<LoadSessionResponse>;
    /**
     * Sets the operational mode for a session.
     *
     * Allows switching between different agent modes (e.g., "ask", "architect", "code")
     * that affect system prompts, tool availability, and permission behaviors.
     *
     * The mode must be one of the modes advertised in `availableModes` during session
     * creation or loading. Agents may also change modes autonomously and notify the
     * client via `current_mode_update` notifications.
     *
     * This method can be called at any time during a session, whether the Agent is
     * idle or actively generating a turn.
     *
     * See protocol docs: [Session Modes](https://agentclientprotocol.com/protocol/session-modes)
     */
    setSessionMode(params: SetSessionModeRequest): Promise<SetSessionModeResponse>;
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
    authenticate(params: AuthenticateRequest): Promise<AuthenticateResponse>;
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
    /**
     * Extension method
     *
     * Allows the Client to send an arbitrary request that is not part of the ACP spec.
     */
    extMethod(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * Extension notification
     *
     * Allows the Client to send an arbitrary notification that is not part of the ACP spec.
     */
    extNotification(method: string, params: Record<string, unknown>): Promise<void>;
}

declare class Connection {
    #private;
    constructor(requestHandler: RequestHandler, notificationHandler: NotificationHandler, stream: Stream);
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
     * Creates a new terminal to execute a command.
     *
     * Only available if the `terminal` capability is set to `true`.
     *
     * The Agent must call `releaseTerminal` when done with the terminal
     * to free resources.
  
     * @see {@link https://agentclientprotocol.com/protocol/terminals | Terminal Documentation}
     */
    createTerminal?(params: CreateTerminalRequest): Promise<CreateTerminalResponse>;
    /**
     * Gets the current output and exit status of a terminal.
     *
     * Returns immediately without waiting for the command to complete.
     * If the command has already exited, the exit status is included.
     *
     * @see {@link https://agentclientprotocol.com/protocol/terminals#getting-output | Getting Terminal Output}
     */
    terminalOutput?(params: TerminalOutputRequest): Promise<TerminalOutputResponse>;
    /**
     * Releases a terminal and frees all associated resources.
     *
     * The command is killed if it hasn't exited yet. After release,
     * the terminal ID becomes invalid for all other terminal methods.
     *
     * Tool calls that already contain the terminal ID continue to
     * display its output.
     *
     * @see {@link https://agentclientprotocol.com/protocol/terminals#releasing-terminals | Releasing Terminals}
     */
    releaseTerminal?(params: ReleaseTerminalRequest): Promise<ReleaseTerminalResponse | void>;
    /**
     * Waits for a terminal command to exit and returns its exit status.
     *
     * This method returns once the command completes, providing the
     * exit code and/or signal that terminated the process.
     *
     * @see {@link https://agentclientprotocol.com/protocol/terminals#waiting-for-exit | Waiting for Exit}
     */
    waitForTerminalExit?(params: WaitForTerminalExitRequest): Promise<WaitForTerminalExitResponse>;
    /**
     * Kills a terminal command without releasing the terminal.
     *
     * While `releaseTerminal` also kills the command, this method keeps
     * the terminal ID valid so it can be used with other methods.
     *
     * Useful for implementing command timeouts that terminate the command
     * and then retrieve the final output.
     *
     * Note: Call `releaseTerminal` when the terminal is no longer needed.
     *
     * @see {@link https://agentclientprotocol.com/protocol/terminals#killing-commands | Killing Commands}
     */
    killTerminal?(params: KillTerminalCommandRequest): Promise<KillTerminalResponse | void>;
    /**
     * Extension method
     *
     * Allows the Agent to send an arbitrary request that is not part of the ACP spec.
     *
     * To help avoid conflicts, it's a good practice to prefix extension
     * methods with a unique identifier such as domain name.
     */
    extMethod?(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * Extension notification
     *
     * Allows the Agent to send an arbitrary notification that is not part of the ACP spec.
     */
    extNotification?(method: string, params: Record<string, unknown>): Promise<void>;
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
    loadSession?(params: LoadSessionRequest): Promise<LoadSessionResponse>;
    /**
     * Sets the operational mode for a session.
     *
     * Allows switching between different agent modes (e.g., "ask", "architect", "code")
     * that affect system prompts, tool availability, and permission behaviors.
     *
     * The mode must be one of the modes advertised in `availableModes` during session
     * creation or loading. Agents may also change modes autonomously and notify the
     * client via `current_mode_update` notifications.
     *
     * This method can be called at any time during a session, whether the Agent is
     * idle or actively generating a turn.
     *
     * See protocol docs: [Session Modes](https://agentclientprotocol.com/protocol/session-modes)
     */
    setSessionMode?(params: SetSessionModeRequest): Promise<SetSessionModeResponse | void>;
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
    authenticate(params: AuthenticateRequest): Promise<AuthenticateResponse | void>;
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
    /**
     * Extension method
     *
     * Allows the Client to send an arbitrary request that is not part of the ACP spec.
     *
     * To help avoid conflicts, it's a good practice to prefix extension
     * methods with a unique identifier such as domain name.
     */
    extMethod?(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * Extension notification
     *
     * Allows the Client to send an arbitrary notification that is not part of the ACP spec.
     */
    extNotification?(method: string, params: Record<string, unknown>): Promise<void>;
}

export { type Agent, AgentSideConnection, type AnyMessage, AuthenticateRequest, AuthenticateResponse, CancelNotification, type Client, ClientSideConnection, CreateTerminalRequest, CreateTerminalResponse, InitializeRequest, InitializeResponse, KillTerminalCommandRequest, KillTerminalResponse, LoadSessionRequest, LoadSessionResponse, NewSessionRequest, NewSessionResponse, PromptRequest, PromptResponse, ReadTextFileRequest, ReadTextFileResponse, ReleaseTerminalRequest, ReleaseTerminalResponse, RequestError, RequestPermissionRequest, RequestPermissionResponse, SessionNotification, SetSessionModeRequest, SetSessionModeResponse, type Stream, TerminalHandle, TerminalOutputRequest, TerminalOutputResponse, WaitForTerminalExitRequest, WaitForTerminalExitResponse, WriteTextFileRequest, WriteTextFileResponse, ndJsonStream };
