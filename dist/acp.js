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
  availableCommandInputSchema,
  availableCommandSchema,
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
  extMethodRequest1Schema,
  extMethodRequestSchema,
  extMethodResponse1Schema,
  extMethodResponseSchema,
  extNotification1Schema,
  extNotificationSchema,
  external_exports,
  fileSystemCapabilitySchema,
  httpHeaderSchema,
  initializeRequestSchema,
  initializeResponseSchema,
  killTerminalCommandRequestSchema,
  killTerminalResponseSchema,
  loadSessionRequestSchema,
  loadSessionResponseSchema,
  mcpCapabilitiesSchema,
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
  sessionModeIdSchema,
  sessionModeSchema,
  sessionModeStateSchema,
  sessionNotificationSchema,
  setSessionModeRequestSchema,
  setSessionModeResponseSchema,
  stdioSchema,
  terminalExitStatusSchema,
  terminalOutputRequestSchema,
  terminalOutputResponseSchema,
  textResourceContentsSchema,
  toolCallContentSchema,
  toolCallLocationSchema,
  toolCallStatusSchema,
  toolCallUpdateSchema,
  toolKindSchema,
  unstructuredCommandInputSchema,
  waitForTerminalExitRequestSchema,
  waitForTerminalExitResponseSchema,
  writeTextFileRequestSchema,
  writeTextFileResponseSchema
} from "./chunk-GOJNWGAH.js";

// typescript/stream.ts
function ndJsonStream(output, input) {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  const readable = new ReadableStream({
    async start(controller) {
      let content = "";
      const reader = input.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          if (!value) {
            continue;
          }
          content += textDecoder.decode(value, { stream: true });
          const lines = content.split("\n");
          content = lines.pop() || "";
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              try {
                const message = JSON.parse(trimmedLine);
                controller.enqueue(message);
              } catch (err) {
                console.error(
                  "Failed to parse JSON message:",
                  trimmedLine,
                  err
                );
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    }
  });
  const writable = new WritableStream({
    async write(message) {
      const content = JSON.stringify(message) + "\n";
      const writer = output.getWriter();
      try {
        await writer.write(textEncoder.encode(content));
      } finally {
        writer.releaseLock();
      }
    }
  });
  return { readable, writable };
}

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
   * @param stream - The bidirectional message stream for communication. Typically created using
   *                 {@link ndJsonStream} for stdio-based connections.
   *
   * See protocol docs: [Communication Model](https://agentclientprotocol.com/protocol/overview#communication-model)
   */
  constructor(toAgent, stream) {
    const agent = toAgent(this);
    const requestHandler = async (method, params) => {
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
        case AGENT_METHODS.session_set_mode: {
          if (!agent.setSessionMode) {
            throw RequestError.methodNotFound(method);
          }
          const validatedParams = setSessionModeRequestSchema.parse(params);
          const result = await agent.setSessionMode(
            validatedParams
          );
          return result ?? {};
        }
        case AGENT_METHODS.authenticate: {
          const validatedParams = authenticateRequestSchema.parse(params);
          const result = await agent.authenticate(
            validatedParams
          );
          return result ?? {};
        }
        case AGENT_METHODS.session_prompt: {
          const validatedParams = promptRequestSchema.parse(params);
          return agent.prompt(validatedParams);
        }
        default:
          if (method.startsWith("_")) {
            if (!agent.extMethod) {
              throw RequestError.methodNotFound(method);
            }
            return agent.extMethod(
              method.substring(1),
              params
            );
          }
          throw RequestError.methodNotFound(method);
      }
    };
    const notificationHandler = async (method, params) => {
      switch (method) {
        case AGENT_METHODS.session_cancel: {
          const validatedParams = cancelNotificationSchema.parse(params);
          return agent.cancel(validatedParams);
        }
        default:
          if (method.startsWith("_")) {
            if (!agent.extNotification) {
              return;
            }
            return agent.extNotification(
              method.substring(1),
              params
            );
          }
          throw RequestError.methodNotFound(method);
      }
    };
    this.#connection = new Connection(
      requestHandler,
      notificationHandler,
      stream
    );
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
    ) ?? {};
  }
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
  /**
   * Extension method
   *
   * Allows the Agent to send an arbitrary request that is not part of the ACP spec.
   */
  async extMethod(method, params) {
    return await this.#connection.sendRequest(`_${method}`, params);
  }
  /**
   * Extension notification
   *
   * Allows the Agent to send an arbitrary notification that is not part of the ACP spec.
   */
  async extNotification(method, params) {
    return await this.#connection.sendNotification(`_${method}`, params);
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
  /**
   * Gets the current terminal output without waiting for the command to exit.
   */
  async currentOutput() {
    return await this.#connection.sendRequest(
      CLIENT_METHODS.terminal_output,
      {
        sessionId: this.#sessionId,
        terminalId: this.id
      }
    );
  }
  /**
   * Waits for the terminal command to complete and returns its exit status.
   */
  async waitForExit() {
    return await this.#connection.sendRequest(
      CLIENT_METHODS.terminal_wait_for_exit,
      {
        sessionId: this.#sessionId,
        terminalId: this.id
      }
    );
  }
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
  async kill() {
    return await this.#connection.sendRequest(CLIENT_METHODS.terminal_kill, {
      sessionId: this.#sessionId,
      terminalId: this.id
    }) ?? {};
  }
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
  async release() {
    return await this.#connection.sendRequest(
      CLIENT_METHODS.terminal_release,
      {
        sessionId: this.#sessionId,
        terminalId: this.id
      }
    ) ?? {};
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
   * @param stream - The bidirectional message stream for communication. Typically created using
   *                 {@link ndJsonStream} for stdio-based connections.
   *
   * See protocol docs: [Communication Model](https://agentclientprotocol.com/protocol/overview#communication-model)
   */
  constructor(toClient, stream) {
    const client = toClient(this);
    const requestHandler = async (method, params) => {
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
          const result = await client.releaseTerminal?.(
            validatedParams
          );
          return result ?? {};
        }
        case CLIENT_METHODS.terminal_wait_for_exit: {
          const validatedParams = waitForTerminalExitRequestSchema.parse(params);
          return client.waitForTerminalExit?.(
            validatedParams
          );
        }
        case CLIENT_METHODS.terminal_kill: {
          const validatedParams = killTerminalCommandRequestSchema.parse(params);
          const result = await client.killTerminal?.(
            validatedParams
          );
          return result ?? {};
        }
        default:
          if (method.startsWith("_")) {
            const customMethod = method.substring(1);
            if (!client.extMethod) {
              throw RequestError.methodNotFound(method);
            }
            return client.extMethod(
              customMethod,
              params
            );
          }
          throw RequestError.methodNotFound(method);
      }
    };
    const notificationHandler = async (method, params) => {
      switch (method) {
        case CLIENT_METHODS.session_update: {
          const validatedParams = sessionNotificationSchema.parse(params);
          return client.sessionUpdate(
            validatedParams
          );
        }
        default:
          if (method.startsWith("_")) {
            const customMethod = method.substring(1);
            if (!client.extNotification) {
              return;
            }
            return client.extNotification(
              customMethod,
              params
            );
          }
          throw RequestError.methodNotFound(method);
      }
    };
    this.#connection = new Connection(
      requestHandler,
      notificationHandler,
      stream
    );
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
    return await this.#connection.sendRequest(
      AGENT_METHODS.session_load,
      params
    ) ?? {};
  }
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
  async setSessionMode(params) {
    return await this.#connection.sendRequest(
      AGENT_METHODS.session_set_mode,
      params
    ) ?? {};
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
    ) ?? {};
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
  /**
   * Extension method
   *
   * Allows the Client to send an arbitrary request that is not part of the ACP spec.
   */
  async extMethod(method, params) {
    return await this.#connection.sendRequest(`_${method}`, params);
  }
  /**
   * Extension notification
   *
   * Allows the Client to send an arbitrary notification that is not part of the ACP spec.
   */
  async extNotification(method, params) {
    return await this.#connection.sendNotification(`_${method}`, params);
  }
};
var Connection = class {
  #pendingResponses = /* @__PURE__ */ new Map();
  #nextRequestId = 0;
  #requestHandler;
  #notificationHandler;
  #stream;
  #writeQueue = Promise.resolve();
  constructor(requestHandler, notificationHandler, stream) {
    this.#requestHandler = requestHandler;
    this.#notificationHandler = notificationHandler;
    this.#stream = stream;
    this.#receive();
  }
  async #receive() {
    const reader = this.#stream.readable.getReader();
    try {
      while (true) {
        const { value: message, done } = await reader.read();
        if (done) {
          break;
        }
        if (!message) {
          continue;
        }
        try {
          this.#processMessage(message);
        } catch (err) {
          console.error(
            "Unexpected error during message processing:",
            message,
            err
          );
          if ("id" in message && message.id !== void 0) {
            this.#sendMessage({
              jsonrpc: "2.0",
              id: message.id,
              error: {
                code: -32700,
                message: "Parse error"
              }
            });
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  async #processMessage(message) {
    if ("method" in message && "id" in message) {
      const response = await this.#tryCallRequestHandler(
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
      const response = await this.#tryCallNotificationHandler(
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
  async #tryCallRequestHandler(method, params) {
    try {
      const result = await this.#requestHandler(method, params);
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
  async #tryCallNotificationHandler(method, params) {
    try {
      await this.#notificationHandler(method, params);
      return { result: null };
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
  async #sendMessage(message) {
    this.#writeQueue = this.#writeQueue.then(async () => {
      const writer = this.#stream.writable.getWriter();
      try {
        await writer.write(message);
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
  availableCommandInputSchema,
  availableCommandSchema,
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
  extMethodRequest1Schema,
  extMethodRequestSchema,
  extMethodResponse1Schema,
  extMethodResponseSchema,
  extNotification1Schema,
  extNotificationSchema,
  fileSystemCapabilitySchema,
  httpHeaderSchema,
  initializeRequestSchema,
  initializeResponseSchema,
  killTerminalCommandRequestSchema,
  killTerminalResponseSchema,
  loadSessionRequestSchema,
  loadSessionResponseSchema,
  mcpCapabilitiesSchema,
  mcpServerSchema,
  ndJsonStream,
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
  sessionModeIdSchema,
  sessionModeSchema,
  sessionModeStateSchema,
  sessionNotificationSchema,
  setSessionModeRequestSchema,
  setSessionModeResponseSchema,
  stdioSchema,
  terminalExitStatusSchema,
  terminalOutputRequestSchema,
  terminalOutputResponseSchema,
  textResourceContentsSchema,
  toolCallContentSchema,
  toolCallLocationSchema,
  toolCallStatusSchema,
  toolCallUpdateSchema,
  toolKindSchema,
  unstructuredCommandInputSchema,
  waitForTerminalExitRequestSchema,
  waitForTerminalExitResponseSchema,
  writeTextFileRequestSchema,
  writeTextFileResponseSchema
};
