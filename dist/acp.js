import {
  AGENT_METHODS,
  CLIENT_METHODS,
  PROTOCOL_VERSION,
  agentCapabilitiesSchema,
  agentClientProtocolSchema,
  agentNotificationSchema,
  agentRequestSchema,
  agentResponseSchema,
  annotationsSchema,
  authMethodSchema,
  authenticateRequestSchema,
  authenticateResponseSchema,
  blobResourceContentsSchema,
  cancelNotificationSchema,
  clientCapabilitiesSchema,
  clientNotificationSchema,
  clientRequestSchema,
  clientResponseSchema,
  contentBlockSchema,
  createTerminalRequestSchema,
  createTerminalResponseSchema,
  embeddedResourceResourceSchema,
  envVariableSchema,
  external_exports,
  fileSystemCapabilitySchema,
  initializeRequestSchema,
  initializeResponseSchema,
  loadSessionRequestSchema,
  loadSessionResponseSchema,
  mcpServerSchema,
  newSessionRequestSchema,
  newSessionResponseSchema,
  permissionOptionSchema,
  planEntrySchema,
  promptCapabilitiesSchema,
  promptRequestSchema,
  promptResponseSchema,
  readTextFileRequestSchema,
  readTextFileResponseSchema,
  releaseTerminalRequestSchema,
  releaseTerminalResponseSchema,
  requestPermissionRequestSchema,
  requestPermissionResponseSchema,
  roleSchema,
  sessionIdSchema,
  sessionNotificationSchema,
  terminalExitStatusSchema,
  terminalOutputRequestSchema,
  terminalOutputResponseSchema,
  textResourceContentsSchema,
  toolCallContentSchema,
  toolCallLocationSchema,
  toolCallStatusSchema,
  toolCallUpdateSchema,
  toolKindSchema,
  waitForTerminalExitRequestSchema,
  waitForTerminalExitResponseSchema,
  writeTextFileRequestSchema,
  writeTextFileResponseSchema
} from "./chunk-5YSLOIKK.js";

// typescript/acp.ts
var AgentSideConnection = class {
  #connection;
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
  constructor(toAgent, input, output) {
    const agent = toAgent(this);
    const handler = async (method, params) => {
      switch (method) {
        case AGENT_METHODS.initialize: {
          const validatedParams = initializeRequestSchema.parse(params);
          return agent.initialize(validatedParams);
        }
        case AGENT_METHODS.session_new: {
          const validatedParams = newSessionRequestSchema.parse(params);
          return agent.newSession(validatedParams);
        }
        case AGENT_METHODS.session_load: {
          if (!agent.loadSession) {
            throw RequestError.methodNotFound(method);
          }
          const validatedParams = loadSessionRequestSchema.parse(params);
          return agent.loadSession(
            validatedParams
          );
        }
        case AGENT_METHODS.authenticate: {
          const validatedParams = authenticateRequestSchema.parse(params);
          return agent.authenticate(
            validatedParams
          );
        }
        case AGENT_METHODS.session_prompt: {
          const validatedParams = promptRequestSchema.parse(params);
          return agent.prompt(validatedParams);
        }
        case AGENT_METHODS.session_cancel: {
          const validatedParams = cancelNotificationSchema.parse(params);
          return agent.cancel(validatedParams);
        }
        default:
          throw RequestError.methodNotFound(method);
      }
    };
    this.#connection = new Connection(handler, input, output);
  }
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
  async sessionUpdate(params) {
    return await this.#connection.sendNotification(
      CLIENT_METHODS.session_update,
      params
    );
  }
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
  async requestPermission(params) {
    return await this.#connection.sendRequest(
      CLIENT_METHODS.session_request_permission,
      params
    );
  }
  /**
   * Reads content from a text file in the client's file system.
   *
   * Only available if the client advertises the `fs.readTextFile` capability.
   * Allows the agent to access file contents within the client's environment.
   *
   * See protocol docs: [Client](https://agentclientprotocol.com/protocol/overview#client)
   */
  async readTextFile(params) {
    return await this.#connection.sendRequest(
      CLIENT_METHODS.fs_read_text_file,
      params
    );
  }
  /**
   * Writes content to a text file in the client's file system.
   *
   * Only available if the client advertises the `fs.writeTextFile` capability.
   * Allows the agent to create or modify files within the client's environment.
   *
   * See protocol docs: [Client](https://agentclientprotocol.com/protocol/overview#client)
   */
  async writeTextFile(params) {
    return await this.#connection.sendRequest(
      CLIENT_METHODS.fs_write_text_file,
      params
    );
  }
  /**
   *  @internal **UNSTABLE**
   *
   * This method is not part of the spec, and may be removed or changed at any point.
   */
  async createTerminal(params) {
    const response = await this.#connection.sendRequest(
      CLIENT_METHODS.terminal_create,
      params
    );
    return new TerminalHandle(
      response.terminalId,
      params.sessionId,
      this.#connection
    );
  }
};
var TerminalHandle = class {
  constructor(id, sessionId, conn) {
    this.id = id;
    this.#sessionId = sessionId;
    this.#connection = conn;
  }
  #sessionId;
  #connection;
  async currentOutput() {
    return await this.#connection.sendRequest(
      CLIENT_METHODS.terminal_output,
      {
        sessionId: this.#sessionId,
        terminalId: this.id
      }
    );
  }
  async waitForExit() {
    return await this.#connection.sendRequest(
      CLIENT_METHODS.terminal_wait_for_exit,
      {
        sessionId: this.#sessionId,
        terminalId: this.id
      }
    );
  }
  async release() {
    await this.#connection.sendRequest(CLIENT_METHODS.terminal_release, {
      sessionId: this.#sessionId,
      terminalId: this.id
    });
  }
  async [Symbol.asyncDispose]() {
    await this.release();
  }
};
var ClientSideConnection = class {
  #connection;
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
  constructor(toClient, input, output) {
    const handler = async (method, params) => {
      const client = toClient(this);
      switch (method) {
        case CLIENT_METHODS.fs_write_text_file: {
          const validatedParams = writeTextFileRequestSchema.parse(params);
          return client.writeTextFile(
            validatedParams
          );
        }
        case CLIENT_METHODS.fs_read_text_file: {
          const validatedParams = readTextFileRequestSchema.parse(params);
          return client.readTextFile(
            validatedParams
          );
        }
        case CLIENT_METHODS.session_request_permission: {
          const validatedParams = requestPermissionRequestSchema.parse(params);
          return client.requestPermission(
            validatedParams
          );
        }
        case CLIENT_METHODS.session_update: {
          const validatedParams = sessionNotificationSchema.parse(params);
          return client.sessionUpdate(
            validatedParams
          );
        }
        case CLIENT_METHODS.terminal_create: {
          const validatedParams = createTerminalRequestSchema.parse(params);
          return client.createTerminal?.(
            validatedParams
          );
        }
        case CLIENT_METHODS.terminal_output: {
          const validatedParams = terminalOutputRequestSchema.parse(params);
          return client.terminalOutput?.(
            validatedParams
          );
        }
        case CLIENT_METHODS.terminal_release: {
          const validatedParams = releaseTerminalRequestSchema.parse(params);
          return client.releaseTerminal?.(
            validatedParams
          );
        }
        case CLIENT_METHODS.terminal_wait_for_exit: {
          const validatedParams = waitForTerminalExitRequestSchema.parse(params);
          return client.waitForTerminalExit?.(
            validatedParams
          );
        }
        default:
          throw RequestError.methodNotFound(method);
      }
    };
    this.#connection = new Connection(handler, input, output);
  }
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
  async initialize(params) {
    return await this.#connection.sendRequest(
      AGENT_METHODS.initialize,
      params
    );
  }
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
  async newSession(params) {
    return await this.#connection.sendRequest(
      AGENT_METHODS.session_new,
      params
    );
  }
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
  async loadSession(params) {
    await this.#connection.sendRequest(
      AGENT_METHODS.session_load,
      params
    );
  }
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
  async authenticate(params) {
    return await this.#connection.sendRequest(
      AGENT_METHODS.authenticate,
      params
    );
  }
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
  async prompt(params) {
    return await this.#connection.sendRequest(
      AGENT_METHODS.session_prompt,
      params
    );
  }
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
  async cancel(params) {
    return await this.#connection.sendNotification(
      AGENT_METHODS.session_cancel,
      params
    );
  }
};
var Connection = class {
  #pendingResponses = /* @__PURE__ */ new Map();
  #nextRequestId = 0;
  #handler;
  #peerInput;
  #writeQueue = Promise.resolve();
  #textEncoder;
  constructor(handler, peerInput, peerOutput) {
    this.#handler = handler;
    this.#peerInput = peerInput;
    this.#textEncoder = new TextEncoder();
    this.#receive(peerOutput);
  }
  async #receive(output) {
    let content = "";
    const decoder = new TextDecoder();
    for await (const chunk of output) {
      content += decoder.decode(chunk, { stream: true });
      const lines = content.split("\n");
      content = lines.pop() || "";
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          let id;
          try {
            const message = JSON.parse(trimmedLine);
            id = message.id;
            this.#processMessage(message);
          } catch (err) {
            console.error(
              "Unexpected error during message processing:",
              trimmedLine,
              err
            );
            if (id) {
              this.#sendMessage({
                jsonrpc: "2.0",
                id,
                error: {
                  code: -32700,
                  message: "Parse error"
                }
              });
            }
          }
        }
      }
    }
  }
  async #processMessage(message) {
    if ("method" in message && "id" in message) {
      const response = await this.#tryCallHandler(
        message.method,
        message.params
      );
      if ("error" in response) {
        console.error("Error handling request", message, response.error);
      }
      await this.#sendMessage({
        jsonrpc: "2.0",
        id: message.id,
        ...response
      });
    } else if ("method" in message) {
      const response = await this.#tryCallHandler(
        message.method,
        message.params
      );
      if ("error" in response) {
        console.error("Error handling notification", message, response.error);
      }
    } else if ("id" in message) {
      this.#handleResponse(message);
    } else {
      console.error("Invalid message", { message });
    }
  }
  async #tryCallHandler(method, params) {
    try {
      const result = await this.#handler(method, params);
      return { result: result ?? null };
    } catch (error) {
      if (error instanceof RequestError) {
        return error.toResult();
      }
      if (error instanceof external_exports.ZodError) {
        return RequestError.invalidParams(error.format()).toResult();
      }
      let details;
      if (error instanceof Error) {
        details = error.message;
      } else if (typeof error === "object" && error != null && "message" in error && typeof error.message === "string") {
        details = error.message;
      }
      try {
        return RequestError.internalError(
          details ? JSON.parse(details) : {}
        ).toResult();
      } catch (_err) {
        return RequestError.internalError({ details }).toResult();
      }
    }
  }
  #handleResponse(response) {
    const pendingResponse = this.#pendingResponses.get(response.id);
    if (pendingResponse) {
      if ("result" in response) {
        pendingResponse.resolve(response.result);
      } else if ("error" in response) {
        pendingResponse.reject(response.error);
      }
      this.#pendingResponses.delete(response.id);
    } else {
      console.error("Got response to unknown request", response.id);
    }
  }
  async sendRequest(method, params) {
    const id = this.#nextRequestId++;
    const responsePromise = new Promise((resolve, reject) => {
      this.#pendingResponses.set(id, { resolve, reject });
    });
    await this.#sendMessage({ jsonrpc: "2.0", id, method, params });
    return responsePromise;
  }
  async sendNotification(method, params) {
    await this.#sendMessage({ jsonrpc: "2.0", method, params });
  }
  async #sendMessage(json) {
    const content = JSON.stringify(json) + "\n";
    this.#writeQueue = this.#writeQueue.then(async () => {
      const writer = this.#peerInput.getWriter();
      try {
        await writer.write(this.#textEncoder.encode(content));
      } finally {
        writer.releaseLock();
      }
    }).catch((error) => {
      console.error("ACP write error:", error);
    });
    return this.#writeQueue;
  }
};
var RequestError = class _RequestError extends Error {
  constructor(code, message, data) {
    super(message);
    this.code = code;
    this.name = "RequestError";
    this.data = data;
  }
  data;
  /**
   * Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.
   */
  static parseError(data) {
    return new _RequestError(-32700, "Parse error", data);
  }
  /**
   * The JSON sent is not a valid Request object.
   */
  static invalidRequest(data) {
    return new _RequestError(-32600, "Invalid request", data);
  }
  /**
   * The method does not exist / is not available.
   */
  static methodNotFound(method) {
    return new _RequestError(-32601, "Method not found", { method });
  }
  /**
   * Invalid method parameter(s).
   */
  static invalidParams(data) {
    return new _RequestError(-32602, "Invalid params", data);
  }
  /**
   * Internal JSON-RPC error.
   */
  static internalError(data) {
    return new _RequestError(-32603, "Internal error", data);
  }
  /**
   * Authentication required.
   */
  static authRequired(data) {
    return new _RequestError(-32e3, "Authentication required", data);
  }
  toResult() {
    return {
      error: {
        code: this.code,
        message: this.message,
        data: this.data
      }
    };
  }
  toErrorResponse() {
    return {
      code: this.code,
      message: this.message,
      data: this.data
    };
  }
};
export {
  AGENT_METHODS,
  AgentSideConnection,
  CLIENT_METHODS,
  ClientSideConnection,
  PROTOCOL_VERSION,
  RequestError,
  TerminalHandle,
  agentCapabilitiesSchema,
  agentClientProtocolSchema,
  agentNotificationSchema,
  agentRequestSchema,
  agentResponseSchema,
  annotationsSchema,
  authMethodSchema,
  authenticateRequestSchema,
  authenticateResponseSchema,
  blobResourceContentsSchema,
  cancelNotificationSchema,
  clientCapabilitiesSchema,
  clientNotificationSchema,
  clientRequestSchema,
  clientResponseSchema,
  contentBlockSchema,
  createTerminalRequestSchema,
  createTerminalResponseSchema,
  embeddedResourceResourceSchema,
  envVariableSchema,
  fileSystemCapabilitySchema,
  initializeRequestSchema,
  initializeResponseSchema,
  loadSessionRequestSchema,
  loadSessionResponseSchema,
  mcpServerSchema,
  newSessionRequestSchema,
  newSessionResponseSchema,
  permissionOptionSchema,
  planEntrySchema,
  promptCapabilitiesSchema,
  promptRequestSchema,
  promptResponseSchema,
  readTextFileRequestSchema,
  readTextFileResponseSchema,
  releaseTerminalRequestSchema,
  releaseTerminalResponseSchema,
  requestPermissionRequestSchema,
  requestPermissionResponseSchema,
  roleSchema,
  sessionIdSchema,
  sessionNotificationSchema,
  terminalExitStatusSchema,
  terminalOutputRequestSchema,
  terminalOutputResponseSchema,
  textResourceContentsSchema,
  toolCallContentSchema,
  toolCallLocationSchema,
  toolCallStatusSchema,
  toolCallUpdateSchema,
  toolKindSchema,
  waitForTerminalExitRequestSchema,
  waitForTerminalExitResponseSchema,
  writeTextFileRequestSchema,
  writeTextFileResponseSchema
};
