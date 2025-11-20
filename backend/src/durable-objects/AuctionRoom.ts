export class AuctionRoomDO {
  state: DurableObjectState;
  sessions: Set<WebSocket>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sessions = new Set();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket', { status: 400 });
      }

      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      this.sessions.add(server);

      server.accept();
      server.addEventListener('message', (event) => {
        this.broadcast(event.data as string, server);
      });

      server.addEventListener('close', () => {
        this.sessions.delete(server);
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response('Auction Room Durable Object', { status: 200 });
  }

  broadcast(message: string, sender: WebSocket) {
    for (const session of this.sessions) {
      if (session !== sender) {
        session.send(message);
      }
    }
  }
}
