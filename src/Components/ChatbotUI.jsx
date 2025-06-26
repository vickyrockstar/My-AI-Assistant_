import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Typography,
  Box,
  Avatar,
  Divider,
  CircularProgress,
  Fade,
  Tooltip,
  Checkbox
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Send as SendIcon,
  Chat as ChatIcon,
  Mic as MicIcon,
  DoneAll as DoneAllIcon
} from "@mui/icons-material";

export default function ChatbotUI() {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem("chat_messages");
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

 const sendMessage = async () => {
  if (!input.trim()) return;

  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const userMessage = { type: "user", text: input, timestamp };

  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setIsTyping(true);

  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }) // 👈 NOTE: not 'messages', just 'message'
    });

    const data = await response.json();

    const aiReply = {
      type: "ai",
      text: data.reply || "No response from Gemini",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, aiReply]);
  } catch (err) {
    console.error("Chat error:", err);
    const errorReply = {
      type: "ai",
      text: "Error fetching response from Gemini API.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, errorReply]);
  } finally {
    setIsTyping(false);
  }
};


  const deleteSelectedMessages = () => {
    const newMessages = messages.filter((_, index) => !selectedMessages.includes(index));
    setMessages(newMessages);
    setSelectedMessages([]);
    setSelectionMode(false);
  };

  const toggleSelect = (index) => {
    setSelectedMessages((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const selectAllMessages = () => {
    const allIndexes = messages.map((_, index) => index);
    setSelectedMessages(allIndexes);
  };

  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };
  };

  const handleSwipeDelete = (index) => {
    const newMessages = messages.filter((_, i) => i !== index);
    setMessages(newMessages);
  };

 
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        px: 2
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={3}
        sx={{ width: "100%", maxWidth: 900 }}
      >
        <Card
          sx={{
            width: "100%",
            borderRadius: 4,
            boxShadow: 5,
            backgroundColor: "#ffffff",
            overflow: "hidden"
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <ChatIcon />
                </Avatar>
                <Typography variant="h5" fontWeight={600}>
                  A.I Assistant
                </Typography>
              </Box>
              {selectionMode ? (
                <Box display="flex" gap={1}>
                  <Tooltip title="Select all messages">
                    <IconButton color="primary" onClick={selectAllMessages}>
                      <DoneAllIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete selected messages">
                    <IconButton color="error" onClick={deleteSelectedMessages}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Button variant="outlined" onClick={() => setSelectionMode(true)}>
                  Select
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                height: 450,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                px: 2,
                py: 2,
                borderRadius: 2,
                backgroundColor: "#f9fafb",
                boxShadow: "inset 0 1px 4px rgba(0,0,0,0.1)",
                scrollBehavior: "smooth"
              }}
            >
              {messages.map((msg, index) => (
                <Fade in key={index}>
                  <Box
                    sx={{
                      alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 1,
                      maxWidth: "80%",
                      position: "relative",
                      touchAction: "pan-y"
                    }}
                    onTouchStart={(e) => (e.currentTarget.dataset.swipeX = e.touches[0].clientX)}
                    onTouchEnd={(e) => {
                      const startX = parseFloat(e.currentTarget.dataset.swipeX);
                      const endX = e.changedTouches[0].clientX;
                      if (startX - endX > 100) {
                        if (window.confirm("Delete this message?")) {
                          handleSwipeDelete(index);
                        }
                      }
                    }}
                  >
                    {selectionMode && (
                      <Checkbox
                        size="small"
                        checked={selectedMessages.includes(index)}
                        onChange={() => toggleSelect(index)}
                      />
                    )}
                    {msg.type === "ai" && (
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "grey.400", fontSize: 14 }}>AI</Avatar>
                    )}
                    <Box>
                      <Box
                        sx={{
                          bgcolor: msg.type === "user" ? "primary.light" : "grey.200",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          boxShadow: 1
                        }}
                      >
                        <Typography variant="body2">{msg.text}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                        {msg.timestamp}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ))}
                
              {isTyping && (
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2,
                    py: 1,
                    bgcolor: "grey.100",
                    borderRadius: 2,
                    maxWidth: "80%",
                    boxShadow: 1
                  }}
                >
                  <CircularProgress size={16} thickness={5} />
                  <Typography variant="body2" color="text.secondary">
                    Typing...
                  </Typography>
                </Box>
              )}
              
            </Box>

            <Box display="flex" mt={2} gap={1}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <IconButton color="primary" onClick={sendMessage}>
                <SendIcon />
              </IconButton>
              <Tooltip title="Start voice input">
                <IconButton color="secondary" onClick={handleVoiceInput}>
                  <MicIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

