import { useState, useEffect, useRef } from 'react';
import { useCustomerAuthStore } from '../lib/stores/customer-auth-store';
import { Card, CardHeader, CardContent, CardFooter } from '@/renderer/components/ui/card';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { ScrollArea } from '@/renderer/components/ui/scroll-area';

interface Message {
  text: string;
  sender: {
    id: string;
    name: string;
  };
  timestamp: string;
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { customer } = useCustomerAuthStore();

  useEffect(() => {
    if (!window.electron?.socket) {
      console.error('Socket connection not available');
      return;
    }

    const newSocket = window.electron.socket.connect();
    setSocket(newSocket);

    newSocket.on('chat-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && customer) {
      const messageData: Message = {
        text: newMessage,
        sender: {
          id: customer.id,
          name: customer.full_name || 'Anonim'
        },
        timestamp: new Date().toLocaleString()
      };
      socket.emit('chat-message', messageData);
      setNewMessage('');
    }
  };

  const isMyMessage = (senderId: string) => customer?.id === senderId;

  return (
    <div className="-m-4 h-[calc(100vh-4rem)]">
      <div className="container mx-auto h-full p-6">
        <Card className="mx-auto h-full border rounded-lg shadow-lg overflow-hidden">
          <CardHeader className="border-b">
            <h2 className="text-xl font-semibold">Müşteri Destek</h2>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 h-[calc(100%-8rem)]">
            <ScrollArea className="h-full px-6">
              <div className="space-y-4 py-4">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${isMyMessage(msg.sender.id) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      isMyMessage(msg.sender.id) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{msg.sender.name}</span>
                        <span className="text-xs opacity-70">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm break-words">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="border-t p-4 mt-auto">
            <form onSubmit={sendMessage} className="flex w-full space-x-2">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="flex-1"
              />
              <Button
                type="submit"
                variant="default"
                disabled={!newMessage.trim()}
              >
                Gönder
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}