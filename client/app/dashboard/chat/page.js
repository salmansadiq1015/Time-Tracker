'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuthContent } from '@/app/context/authContext';
import {
  Loader2,
  Send,
  Search,
  MoreVertical,
  Users,
  CheckCheck,
  Check,
  Menu,
  Plus,
  X,
  Dot,
  Paperclip,
  ArrowLeft,
  Trash2,
  UserCircle2,
  Mic,
  Square,
  Play,
  Pause,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) return '00:00';
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const AudioMessage = ({ src, mine }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => setDuration(audio.duration || 0);
    const handleTime = () => setCurrentTime(audio.currentTime || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration || 0);
    };

    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('timeupdate', handleTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('timeupdate', handleTime);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        await audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const progressPercent = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  const containerClasses = mine
    ? 'bg-blue-600/20 text-white border border-blue-500/50'
    : 'bg-[#1e2339] text-gray-200 border border-gray-700/50';

  const knobClasses = mine ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300';
  const progressBaseClasses = mine ? 'bg-blue-500/30' : 'bg-gray-700/30';
  const progressFillClasses = mine ? 'bg-blue-400' : 'bg-blue-500';

  return (
    <div className={`w-60 sm:w-72 rounded-2xl px-3 py-3 ${containerClasses} shadow-inner`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className={`flex h-10 w-10 items-center justify-center rounded-full ${knobClasses} shadow`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <div className="flex-1">
          <div className={`h-1.5 rounded-full overflow-hidden ${progressBaseClasses}`}>
            <div
              className={`h-full ${progressFillClasses}`}
              style={{ width: `${progressPercent}%`, transition: 'width 150ms linear' }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] opacity-70">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </div>
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
    </div>
  );
};

const getAudioExtension = (mimeType) => {
  if (!mimeType) return 'webm';
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return 'm4a';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
};

export default function ChatPage() {
  const { auth } = useAuthContent();
  const router = useRouter();
  const params = useSearchParams();
  const defaultChatParam = params.get('chat');
  const initialChatId =
    defaultChatParam && defaultChatParam !== 'undefined' ? defaultChatParam : '';

  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(initialChatId || '');
  const [messages, setMessages] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [search, setSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editGroupModalOpen, setEditGroupModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [savingEditGroup, setSavingEditGroup] = useState(false);
  const fileInputRef = useRef(null);
  const voiceFileInputRef = useRef(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupMembersLoading, setGroupMembersLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStreamRef = useRef(null);
  const recordingMimeTypeRef = useRef('audio/webm');
  const [recordingError, setRecordingError] = useState('');

  const userId = auth?.user?._id;
  const canCreateGroup = useMemo(
    () => ['admin', 'dispatcher'].includes(auth?.user?.role || ''),
    [auth?.user?.role]
  );
  const canEditGroup = useMemo(
    () => ['admin', 'courier'].includes(auth?.user?.role || ''),
    [auth?.user?.role]
  );

  const activeChat = useMemo(
    () => chats.find((c) => c._id === selectedChatId) || null,
    [chats, selectedChatId]
  );

  const canDeleteChat = useMemo(() => {
    if (!activeChat) return false;
    const role = auth?.user?.role;
    if (role === 'admin') return true;
    if (activeChat.isGroupChat) {
      const adminId =
        typeof activeChat.groupAdmin === 'object'
          ? activeChat.groupAdmin?._id
          : activeChat.groupAdmin;
      return String(adminId) === String(userId);
    }
    return activeChat.users?.some((u) => String(u?._id) === String(userId));
  }, [activeChat, auth?.user?.role, userId]);

  const canViewMembers = useMemo(
    () => Boolean(activeChat?.isGroupChat && Array.isArray(activeChat?.users)),
    [activeChat]
  );

  useEffect(() => {
    if (!canViewMembers) {
      setMembersDialogOpen(false);
      setGroupMembers([]);
    }
  }, [canViewMembers]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!membersDialogOpen || !activeChat) return;
      setGroupMembersLoading(true);
      if (activeChat.isGroupChat) {
        setGroupMembers(Array.isArray(activeChat.users) ? activeChat.users : []);
      } else {
        const other = activeChat.users?.find((u) => String(u._id) !== String(userId));
        setGroupMembers(other ? [other] : []);
      }
      setGroupMembersLoading(false);
    };
    loadMembers();
  }, [membersDialogOpen, activeChat, userId]);

  const setActiveChat = (chatId) => {
    if (!chatId) return;
    setSelectedChatId(chatId);
    try {
      router.replace(`/dashboard/chat?chat=${chatId}`);
    } catch {}
  };

  // Connect socket
  useEffect(() => {
    if (!userId) return;
    const s = io(SOCKET_URL, { query: { userID: userId } });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [userId]);

  // Fetch chats
  useEffect(() => {
    if (!userId) return;
    const fetchChats = async () => {
      setIsLoadingChats(true);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/all/${userId}`
        );
        const list = data?.results || [];
        setChats(list);
        if (!initialChatId && list?.length > 0 && !selectedChatId) {
          setActiveChat(list[0]?._id);
        }
      } catch (e) {
        toast.error('Failed to load chats');
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchChats();
  }, [userId]);

  // Join room on selection
  useEffect(() => {
    if (!socket || !selectedChatId) return;
    socket.emit('join chat', selectedChatId);
  }, [socket, selectedChatId]);

  // Fetch messages when chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChatId) return;
      setIsLoadingMessages(true);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/message/${selectedChatId}`
        );
        setMessages(data?.messages || []);
        setTimeout(() => scrollToBottom(true), 20);

        // Mark as read
        await axios.patch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/message/read/${selectedChatId}`
        );
        if (socket) socket.emit('markRead', { chatId: selectedChatId, userId });

        // Refresh chats to update unread badges
        const chatsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/all/${userId}`
        );
        setChats(chatsRes?.data?.results || []);
      } catch (e) {
        // no-op
      } finally {
        setIsLoadingMessages(false);
        setTimeout(() => scrollToBottom(true), 30);
      }
    };
    loadMessages();
  }, [selectedChatId, socket, userId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const onFetchMessages = (data) => {
      if (data?.chatId !== selectedChatId) return;
      // If server sent the message payload, append immediately for true realtime
      if (data?.message) {
        setMessages((prev) => {
          const exists = prev.some((m) => m?._id === data.message?._id);
          const next = exists ? prev : [...prev, data.message];
          return next;
        });
        setTimeout(() => scrollToBottom(true), 10);
      } else {
        // Fallback: fetch messages for current chat
        axios
          .get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/message/${selectedChatId}`)
          .then((res) => {
            setMessages(res?.data?.messages || []);
            setTimeout(() => scrollToBottom(true), 10);
          });
      }
      // Ensure read + refresh list
      axios
        .patch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/message/read/${selectedChatId}`)
        .then(() => socket.emit('markRead', { chatId: selectedChatId, userId }))
        .catch(() => {});
      if (userId) {
        axios
          .get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/all/${userId}`)
          .then((r) => setChats(r?.data?.results || []));
      }
    };
    const onNewSummary = () => {
      // refresh chat list
      if (userId) {
        axios
          .get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/all/${userId}`)
          .then((res) => setChats(res?.data?.results || []));
      }
      if (selectedChatId) {
        axios
          .patch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/message/read/${selectedChatId}`)
          .then(() => socket.emit('markRead', { chatId: selectedChatId, userId }))
          .catch(() => {});
      }
    };
    const onTyping = () => setIsTyping(true);
    const onStopTyping = () => setIsTyping(false);
    const onMessagesRead = ({ chatId }) => {
      if (chatId === selectedChatId && userId) {
        axios
          .get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/all/${userId}`)
          .then((res) => setChats(res?.data?.results || []));
      }
    };

    socket.on('fetchMessages', onFetchMessages);
    socket.on('newMessageSummary', onNewSummary);
    socket.on('typing', onTyping);
    socket.on('stop typing', onStopTyping);
    socket.on('messagesRead', onMessagesRead);
    socket.on('newUserData', onNewSummary);
    const onReaction = ({ chatId, reaction }) => {
      if (chatId === selectedChatId && reaction?.messageId) {
        setMessages((prev) => applyReaction(prev, reaction));
      }
    };
    socket.on('messageReaction', onReaction);

    return () => {
      socket.off('fetchMessages', onFetchMessages);
      socket.off('newMessageSummary', onNewSummary);
      socket.off('typing', onTyping);
      socket.off('stop typing', onStopTyping);
      socket.off('messagesRead', onMessagesRead);
      socket.off('newUserData', onNewSummary);
      socket.off('messageReaction', onReaction);
    };
  }, [socket, selectedChatId, userId]);

  const scrollToBottom = (smooth = false) => {
    try {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      } else if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    } catch {}
  };

  // Scroll when messages change or chat switches
  useEffect(() => {
    // small delay so images/videos can size
    const t = setTimeout(() => scrollToBottom(true), 50);
    return () => clearTimeout(t);
  }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => scrollToBottom(false), 50);
    return () => clearTimeout(t);
  }, [selectedChatId]);

  // Load users when opening group modal
  useEffect(() => {
    const run = async () => {
      if (!groupModalOpen && !editGroupModalOpen) return;
      const allowed = groupModalOpen ? canCreateGroup : canEditGroup;
      if (!allowed) return;
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/all`);
        const list = Array.isArray(data?.results?.users)
          ? data.results.users
          : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.results)
          ? data.results
          : [];
        setAllUsers(list);
      } catch (e) {
        // graceful: show once
        toast.error('Failed to load users');
      }
    };
    run();
  }, [groupModalOpen, editGroupModalOpen, canCreateGroup, canEditGroup]);

  // Fetch projects with debounced search
  useEffect(() => {
    if (!groupModalOpen) return;
    const timeoutId = setTimeout(async () => {
      setLoadingProjects(true);
      try {
        const searchTerm = projectSearch.trim();
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/all${
          searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''
        }`;
        const { data } = await axios.get(url);
        const list = Array.isArray(data?.projects)
          ? data.projects
          : Array.isArray(data?.results?.projects)
          ? data.results.projects
          : Array.isArray(data?.results)
          ? data.results
          : [];
        setProjects(list);
      } catch (e) {
        console.error('Failed to load projects:', e);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [groupModalOpen, projectSearch]);

  const toggleSelected = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!canCreateGroup) {
      toast.error('Only admin or dispatcher can create group chats');
      return;
    }
    const finalName = selectedProject
      ? selectedProject.name || selectedProject.projectName
      : groupName.trim();
    if (!finalName || selectedUserIds.length < 2) {
      toast.error('Select a project or enter name and select at least 2 users');
      return;
    }
    setCreatingGroup(true);
    try {
      const payload = {
        chatName: finalName,
        avatar:
          groupAvatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            finalName
          )}&background=c16840&color=fff`,
        users: JSON.stringify(selectedUserIds),
      };
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/group/create`,
        payload
      );
      if (data?.success) {
        toast.success('Group created');
        setGroupModalOpen(false);
        setGroupName('');
        setGroupAvatar('');
        setSelectedUserIds([]);
        setSelectedProject(null);
        setProjectSearch('');
        const chatsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/all/${userId}`
        );
        const list = chatsRes?.data?.results || [];
        setChats(list);
        const newId = data?.groupChat?._id || data?.chat?._id || list?.[0]?._id;
        if (newId) setActiveChat(newId);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  const openEditGroup = () => {
    const current = activeChat;
    if (!current) return;
    setGroupName(current?.chatName || '');
    setGroupAvatar(current?.avatar || '');
    setSelectedUserIds((current?.users || []).map((u) => u._id));
    setEditGroupModalOpen(true);
  };

  const handleSaveEditGroup = async () => {
    if (!canEditGroup) {
      toast.error('Only admin or courier can edit group chats');
      return;
    }
    if (!selectedChatId) return;
    if (!groupName.trim() || selectedUserIds.length < 2) {
      toast.error('Enter name and select at least 2 users');
      return;
    }
    setSavingEditGroup(true);
    try {
      const payload = {
        chatName: groupName.trim(),
        avatar: groupAvatar || undefined,
        users: JSON.stringify(selectedUserIds),
      };
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/group/update/${selectedChatId}`,
        payload
      );
      if (data?.success) {
        toast.success('Group updated');
        setEditGroupModalOpen(false);
        const chatsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/all/${userId}`
        );
        setChats(chatsRes?.data?.results || []);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update group');
    } finally {
      setSavingEditGroup(false);
    }
  };

  const handleDeleteChatClick = () => {
    if (!activeChat) return;
    setConfirmDeleteOpen(true);
    setMenuOpen(false);
  };

  const handleConfirmDeleteChat = async () => {
    if (!activeChat) return;
    try {
      setDeleteLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/delete/${activeChat._id}`
      );
      toast.success('Chat deleted');
      setChats((prev) => prev.filter((chat) => chat._id !== activeChat._id));
      setSelectedChatId('');
      setMessages([]);
      setConfirmDeleteOpen(false);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/all/${userId}`
        );
        setChats(data?.results || []);
      } catch (error) {
        console.error('Failed to refresh chats:', error);
      }
      try {
        router.replace('/dashboard/chat');
      } catch {}
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete chat');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredChats = useMemo(() => {
    if (!search) return chats;
    return chats.filter((c) => {
      const name = c?.isGroupChat ? c?.chatName : c?.users?.find((u) => u._id !== userId)?.name;
      return (name || '').toLowerCase().includes(search.toLowerCase());
    });
  }, [chats, search, userId]);

  const getChatTitle = (chat) => {
    if (!chat) return '';
    if (chat.isGroupChat) return chat.chatName;
    const other = chat.users?.find((u) => u._id !== userId);
    return other?.name || 'Chat';
  };

  const unreadCountFor = (chat) => {
    if (!chat?.unreadMessages) return 0;
    return chat.unreadMessages.filter((u) => String(u.userId) === String(userId)).length;
  };

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedChatId) return;
    setSending(true);
    try {
      const body = { content: messageInput.trim(), chatId: selectedChatId, contentType: 'text' };
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/message/create`,
        body
      );
      // Optimistic append so sender sees message immediately
      if (data?.message) {
        setMessages((prev) => [...prev, data.message]);
        // ensure scroll
        setTimeout(() => scrollToBottom(true), 10);
      }
      setMessageInput('');
      if (socket)
        socket.emit('NewMessageAdded', { chatId: selectedChatId, message: data?.message });
    } catch (e) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const inferContentType = (file) => {
    if (!file?.type) return 'file';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const uploadFileAndSend = async (file) => {
    if (!file || !selectedChatId) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/upload-file`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const urls = Array.isArray(data?.fileUrls)
        ? data.fileUrls
        : [data?.url, data?.fileUrl, data?.path, data?.Location].filter(Boolean);
      const url = urls?.[0] || '';
      if (!url) throw new Error('Upload failed');
      const body = { content: url, chatId: selectedChatId, contentType: inferContentType(file) };
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/message/create`,
        body
      );
      if (socket)
        socket.emit('NewMessageAdded', { chatId: selectedChatId, message: res?.data?.message });
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to upload file');
    } finally {
      setSending(false);
    }
  };

  const handlePickFile = () => fileInputRef.current?.click();
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const f of files) {
      // sequential to preserve order
      // eslint-disable-next-line no-await-in-loop
      await uploadFileAndSend(f);
    }
  };

  // Emoji insert helper
  const insertEmoji = (emoji) => {
    try {
      setMessageInput((prev) => `${prev || ''}${emoji}`);
      setEmojiOpen(false);
    } catch {}
  };

  // Reactions helpers
  const applyReaction = (list, reaction) => {
    return (list || []).map((m) => {
      if (m._id !== reaction.messageId) return m;
      const current = Array.isArray(m.reactions) ? [...m.reactions] : [];
      const idx = current.findIndex((r) => r.emoji === reaction.emoji);
      if (idx >= 0) {
        const set = new Set(current[idx].userIds || []);
        set.add(reaction.userId);
        current[idx] = { emoji: reaction.emoji, userIds: Array.from(set) };
      } else {
        current.push({ emoji: reaction.emoji, userIds: [reaction.userId] });
      }
      return { ...m, reactions: current };
    });
  };

  const sendReaction = async (messageId, emoji) => {
    if (!socket || !selectedChatId) return;
    const reaction = { messageId, emoji, userId };
    // Optimistic update
    setMessages((prev) => applyReaction(prev, reaction));
    // Broadcast
    socket.emit('messageReaction', { chatId: selectedChatId, reaction });
    // Persist to database
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/message/reaction/${messageId}`,
        { emoji }
      );
    } catch (e) {
      console.error('Failed to save reaction:', e);
    }
  };

  const handleTyping = (next) => {
    setMessageInput(next);
    if (!socket || !selectedChatId) return;
    socket.emit('typing', selectedChatId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop typing', selectedChatId);
    }, 1000);
  };

  const triggerVoiceFilePicker = () => {
    try {
      voiceFileInputRef.current?.click();
    } catch (error) {
      console.error('Failed to open voice file picker:', error);
    }
  };

  const handleVoiceFileSelection = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length || !selectedChatId) return;
    for (const file of files) {
      try {
        await uploadFileAndSend(file);
      } catch (error) {
        console.error('Failed to upload selected voice file:', error);
        toast.error('Unable to upload selected audio file.');
      }
    }
  };

  const stopRecordingInternal = () => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Failed to stop recorder:', err);
      }
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      recordingStreamRef.current = null;
    }
  };

  const sendVoiceMessage = async (blob) => {
    if (!blob || !selectedChatId) return;
    const mimeType = recordingMimeTypeRef.current || blob.type || 'audio/webm';
    const extension = getAudioExtension(mimeType);
    try {
      const voiceFile = new File([blob], `voice-${Date.now()}.${extension}`, { type: mimeType });
      await uploadFileAndSend(voiceFile);
    } catch (error) {
      console.error('Failed to upload voice message:', error);
      toast.error('Failed to upload voice message.');
    }
  };

  const startRecording = async () => {
    setRecordingError('');
    if (typeof window === 'undefined') return false;
    if (!window.isSecureContext) {
      const message = 'Voice recording requires a secure (HTTPS) connection.';
      toast.error(`${message} You can still upload an audio file manually.`);
      setRecordingError(message);
      triggerVoiceFilePicker();
      return false;
    }
    if (!navigator?.mediaDevices?.getUserMedia) {
      const message = 'Audio recording is not supported in this browser.';
      toast.error(`${message} Please upload an audio file instead.`);
      setRecordingError(message);
      triggerVoiceFilePicker();
      return false;
    }
    if (typeof window.MediaRecorder !== 'function') {
      const message = 'Media recording is not available in this browser.';
      toast.error(`${message} Please upload an audio file instead.`);
      setRecordingError(message);
      triggerVoiceFilePicker();
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
        'audio/ogg;codecs=opus',
      ];
      let chosenType;
      if (window.MediaRecorder && typeof MediaRecorder.isTypeSupported === 'function') {
        chosenType = supportedTypes.find((type) => MediaRecorder.isTypeSupported(type));
      }
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(
          stream,
          chosenType ? { mimeType: chosenType } : undefined
        );
        recordingMimeTypeRef.current = chosenType || 'audio/webm';
      } catch (recorderError) {
        console.error('Failed to initialize media recorder:', recorderError);
        const message = 'Unable to start voice recorder on this device.';
        toast.error(`${message} You can upload an audio file instead.`);
        setRecordingError(message);
        stream.getTracks().forEach((track) => track.stop());
        triggerVoiceFilePicker();
        return false;
      }
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: recordingMimeTypeRef.current });
        audioChunksRef.current = [];
        setIsRecording(false);
        await sendVoiceMessage(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      const message = error?.message || 'Unable to access microphone.';
      toast.error(`${message} You can upload an audio file instead.`);
      setRecordingError(message);
      stopRecordingInternal();
      setIsRecording(false);
      triggerVoiceFilePicker();
      return false;
    }
  };

  const stopRecording = () => {
    stopRecordingInternal();
  };

  const handleVoiceToggle = async () => {
    if (!selectedChatId) {
      toast.error('Select a chat before recording.');
      return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      const started = await startRecording();
      if (!started) {
        setIsRecording(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopRecordingInternal();
    };
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes reactionPop {
            0% {
              transform: perspective(1000px) rotateX(90deg) scale(0.5);
              opacity: 0;
            }
            50% {
              transform: perspective(1000px) rotateX(-5deg) scale(1.1);
            }
            100% {
              transform: perspective(1000px) rotateX(0deg) scale(1);
              opacity: 1;
            }
          }
        `,
        }}
      />
      <div className="fixed inset-0  z-999989 bg-[#0f1419]">
        {/* Top bar */}
        <div className="h-12 border-b border-gray-700/50 bg-[#1e2339] flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => router.push('/')}
              title="Go to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="text-sm font-semibold text-white">{getChatTitle(activeChat) || 'Messages'}</div>
          </div>
          <div className="flex items-center gap-2">
            {auth?.user?.role === 'user' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/time-tracker')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-[#0f1419]"
                >
                  Time Tracker
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/projects')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-[#0f1419]"
                >
                  Projects
                </Button>
              </>
            )}
            {canCreateGroup && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setGroupModalOpen(true)}
                className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4" /> New group
              </Button>
            )}
          </div>
        </div>

        {/* Main area */}
        <div className="h-[calc(100vh-48px)] flex">
          {/* Desktop sidebar */}
          <div className="hidden lg:flex w-[360px] border-r border-gray-700/50 bg-[#1e2339] flex-col">
            <div className="p-3 border-b border-gray-700/50 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats"
                className="h-9 bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1 overflow-auto">
              {isLoadingChats ? (
                <div className="p-6 text-sm text-gray-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading chats...
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="p-6 text-sm text-gray-400">No chats found</div>
              ) : (
                filteredChats.map((c) => {
                  const active = selectedChatId === c._id;
                  const unread = unreadCountFor(c);
                  const title = getChatTitle(c);
                  const last = c?.latestMessage?.content || '';
                  return (
                    <button
                      key={c._id}
                      onClick={() => setActiveChat(c._id)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-700/50 hover:bg-gray-800/30 transition flex items-start gap-3 ${
                        active ? 'bg-gray-800/50' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm">
                        {c.isGroupChat ? <Users className="w-4 h-4" /> : (title || '?').slice(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium truncate text-white">{title}</div>
                          <div className="text-[10px] text-gray-400 whitespace-nowrap">
                            {new Date(c.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-full">{last}</div>
                      </div>
                      {unread > 0 && (
                        <div className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-blue-600 text-white">
                          {unread}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-700/50 bg-[#1e2339] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/50" />
                <div>
                  <div className="text-sm font-semibold text-white">
                    {getChatTitle(activeChat) || 'Select a chat'}
                  </div>
                  {isTyping && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Dot className="w-4 h-4" /> typing...
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 relative">
                {canEditGroup && activeChat?.isGroupChat && (
                  <Button variant="outline" size="sm" onClick={openEditGroup} className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-[#0f1419]">
                    Edit group
                  </Button>
                )}
                {canViewMembers && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-[#0f1419]"
                    onClick={() => setMembersDialogOpen(true)}
                    title="View members"
                  >
                    <UserCircle2 className="w-4 h-4" />
                  </Button>
                )}
                {canDeleteChat && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-600/20"
                    onClick={handleDeleteChatClick}
                    title="Delete chat"
                    disabled={deleteLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 bg-[#1e2339] border border-gray-700 rounded-md shadow-md w-40 py-1 z-10">
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 text-gray-300 hover:text-white"
                      onClick={() => {
                        setMenuOpen(false);
                        setSelectedChatId('');
                        try {
                          router.replace('/dashboard/chat');
                        } catch {}
                      }}
                    >
                      Close chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-2 bg-[#0f1419]">
              {isLoadingMessages ? (
                <div className="p-4 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`w-[70%] max-w-[380px] rounded-2xl p-3 ${
                          i % 2 ? 'bg-blue-600/20' : 'bg-[#1e2339]'
                        } shadow-sm border border-gray-700/50`}
                      >
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !selectedChatId ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative mx-auto h-24 w-24">
                      <div className="absolute inset-0 rounded-full bg-blue-600/15 animate-ping"></div>
                      <div className="absolute inset-3 rounded-full bg-blue-600/20 animate-pulse"></div>
                      <div className="absolute inset-6 rounded-full bg-blue-600"></div>
                    </div>
                    <div className="mt-4 text-sm font-semibold text-white">
                      Select a chat to start messaging
                    </div>
                    <div className="text-xs text-gray-400">
                      Use the sidebar or menu to pick a conversation
                    </div>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center animate-fade-in">
                    <div className="relative mx-auto h-20 w-20 mb-4">
                      <div className="absolute inset-0 rounded-full bg-blue-600/10 animate-ping"></div>
                      <div className="absolute inset-2 rounded-full bg-blue-600/15 animate-pulse"></div>
                      <div className="absolute inset-4 rounded-full bg-blue-600/20"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <Send className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-white">No messages yet</h3>
                      <p className="text-sm text-gray-400 max-w-xs mx-auto">
                        Start the conversation by sending your first message
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((m) => {
                  const mine = String(m?.sender?._id) === String(userId);
                  const otherParticipant = activeChat?.users?.find((u) => u._id !== userId);
                  const showSender =
                    !mine &&
                    (activeChat?.isGroupChat
                      ? true
                      : Boolean(otherParticipant?.name || otherParticipant?.email));

                  // Check if message is read (not in unreadMessages for other users)
                  const isRead =
                    mine && activeChat?.unreadMessages
                      ? !activeChat.unreadMessages.some(
                          (um) => String(um.messageId) === String(m._id)
                        )
                      : false;

                  return (
                    <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`group relative max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          mine
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-[#1e2339] text-gray-200 rounded-bl-sm border border-gray-700/50'
                        }`}
                      >
                        {showSender && (
                          <div className="text-[11px] font-semibold text-blue-400 mb-1">
                            {m?.sender?.name ||
                              otherParticipant?.name ||
                              otherParticipant?.email ||
                              'Member'}
                          </div>
                        )}
                        {m.contentType === 'image' ? (
                          <img src={m.content} alt="image" className="rounded-md max-w-full" />
                        ) : m.contentType === 'video' ? (
                          <video src={m.content} controls className="rounded-md max-w-full" />
                        ) : m.contentType === 'audio' ? (
                          <AudioMessage src={m.content} mine={mine} />
                        ) : m.contentType === 'file' ? (
                          <a
                            href={m.content}
                            target="_blank"
                            rel="noreferrer"
                            className="underline wrap-break-word"
                          >
                            Download file
                          </a>
                        ) : (
                          <div className="whitespace-pre-wrap wrap-break-word">{m.content}</div>
                        )}
                        {/* Reactions row */}
                        {Array.isArray(m.reactions) && m.reactions.length > 0 && (
                          <div
                            className={`mt-2 flex gap-1.5 flex-wrap ${
                              mine ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {m.reactions.map((r, idx) => (
                              <button
                                key={r.emoji}
                                onClick={() => sendReaction(m._id, r.emoji)}
                                className={`group relative px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 ${
                                  mine
                                    ? 'bg-white/20 text-white hover:bg-white/30'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                                style={{
                                  transform: 'perspective(1000px) rotateX(0deg)',
                                  animation: `reactionPop 0.3s ease-out ${idx * 0.05}s backwards`,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform =
                                    'perspective(1000px) rotateX(-5deg) rotateY(-5deg) scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform =
                                    'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
                                }}
                              >
                                <span className="text-base leading-none">{r.emoji}</span>
                                <span className="ml-1 text-[10px]">{r.userIds?.length || 0}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Hover reaction picker */}
                        <div
                          className={`opacity-[0] group-hover:opacity-[1] absolute bottom-full mb-1 z-50 transition-all duration-200 ${
                            mine ? 'right-0' : 'left-0'
                          }`}
                        >
                          <div className="flex gap-0.5 items-center bg-[#1e2339]/95 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-xl border border-gray-700 w-fit">
                            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((e) => (
                              <button
                                key={e}
                                onClick={() => sendReaction(m._id, e)}
                                className="relative text-lg leading-none p-1 rounded-full hover:bg-gray-700 transition-all duration-200 hover:scale-125 active:scale-95 shrink-0"
                                style={{
                                  transform: 'perspective(1000px) rotateX(0deg)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform =
                                    'perspective(1000px) rotateX(-10deg) rotateY(-10deg) scale(1.3)';
                                  e.currentTarget.style.transition =
                                    'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform =
                                    'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
                                }}
                                title={`React with ${e}`}
                              >
                                <span className="block">{e}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div
                          className={`mt-1 text-[10px] flex items-center gap-1 ${
                            mine ? 'text-blue-100/80' : 'text-gray-400'
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {mine ? (
                            isRead ? (
                              <CheckCheck className="w-3 h-3 text-sky-400" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="p-3 border-t border-gray-700/50 bg-[#1e2339] flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={voiceFileInputRef}
                type="file"
                accept="audio/*"
                capture="microphone"
                className="hidden"
                onChange={handleVoiceFileSelection}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-[#0f1419]"
                  onClick={handlePickFile}
                  disabled={!selectedChatId}
                  title="Send attachment"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  variant={isRecording ? 'destructive' : 'outline'}
                  size="icon"
                  className={`h-10 w-10 transition-all border-gray-600 ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-400/40 animate-pulse'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white bg-[#0f1419]'
                  }`}
                  onClick={handleVoiceToggle}
                  disabled={!selectedChatId || sending}
                  title={isRecording ? 'Stop recording' : 'Record voice message'}
                >
                  {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                {/* Emoji quick picker */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-[#0f1419]"
                    onClick={() => setEmojiOpen((v) => !v)}
                    disabled={!selectedChatId}
                    title="Insert emoji"
                  >
                    😊
                  </Button>
                  {emojiOpen && (
                    <div className="absolute bottom-12 left-0 bg-[#1e2339] border border-gray-700 rounded-md shadow-md p-2 grid grid-cols-4 gap-1 w-40">
                      {['😀', '😂', '😍', '👍', '🙌', '🎉', '🙏', '🔥'].map((e) => (
                        <button
                          key={e}
                          onClick={() => insertEmoji(e)}
                          className="hover:scale-110 transition-transform hover:bg-gray-700 rounded"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Input
                  value={messageInput}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                  placeholder="Type a message"
                  className="h-10 flex-1 bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                  disabled={!selectedChatId}
                />
                <Button onClick={handleSend} disabled={sending || !selectedChatId} className="h-10 bg-blue-600 hover:bg-blue-700 text-white">
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="min-h-[18px] flex items-center gap-3 px-1 text-xs">
                {isRecording && (
                  <span className="flex items-center gap-1 text-rose-400 font-semibold">
                    <span className="inline-flex h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                    Recording...
                  </span>
                )}
                {!isRecording && sending && (
                  <span className="flex items-center gap-2 text-blue-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading...
                  </span>
                )}
                {!isRecording && !sending && recordingError && (
                  <span className="text-rose-400">{recordingError}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer: chat list */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-full sm:w-[420px] bg-[#1e2339] shadow-xl flex flex-col">
              <div className="p-3 border-b border-gray-700/50 flex items-center justify-between">
                <div className="font-semibold text-white">Chats</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-3 flex items-center gap-2 border-b border-gray-700/50">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats"
                  className="h-9 bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1 overflow-auto">
                {isLoadingChats ? (
                  <div className="p-6 text-sm text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading chats...
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="p-6 text-sm text-gray-400">No chats found</div>
                ) : (
                  filteredChats.map((c) => {
                    const active = selectedChatId === c._id;
                    const unread = unreadCountFor(c);
                    const title = getChatTitle(c);
                    const last = c?.latestMessage?.content || '';
                    return (
                      <button
                        key={c._id}
                        onClick={() => {
                          setActiveChat(c._id);
                          setDrawerOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-gray-700/50 hover:bg-gray-800/30 transition flex items-start gap-3 ${
                          active ? 'bg-gray-800/50' : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm">
                          {c.isGroupChat ? (
                            <Users className="w-4 h-4" />
                          ) : (
                            (title || '?').slice(0, 1)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium truncate text-white">{title}</div>
                            <div className="text-[10px] text-gray-400 whitespace-nowrap">
                              {new Date(c.updatedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-full">{last}</div>
                        </div>
                        {unread > 0 && (
                          <div className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-blue-600 text-white">
                            {unread}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Group create modal */}
        {groupModalOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setGroupModalOpen(false)}
            />
            <div className="absolute inset-0 m-auto w-[95%] max-w-xl max-h-[97vh] bg-[#1e2339] rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-700">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between shrink-0">
                <div className="font-semibold text-white">Create group</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => setGroupModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Select project (optional)</div>
                  <div className="relative">
                    <Input
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="Search projects..."
                      className="h-9 bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                    />
                    {loadingProjects && (
                      <div className="absolute right-2 top-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  {projectSearch && (
                    <div className="mt-1 max-h-48 overflow-auto border border-gray-700 rounded-md bg-[#0f1419]">
                      {projects.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-400">No projects found</div>
                      ) : (
                        projects.map((p) => {
                          const projectName = p.name || p.projectName || '';
                          const isSelected = selectedProject?._id === p._id;
                          return (
                            <button
                              key={p._id}
                              onClick={() => {
                                setSelectedProject(p);
                                const projectName = p.name || p.projectName || '';
                                setGroupName(projectName);
                                // Auto-select employees from project
                                if (Array.isArray(p.employees) && p.employees.length > 0) {
                                  const employeeIds = p.employees
                                    .map((emp) => (typeof emp === 'object' ? emp._id : emp))
                                    .filter((id) => id && id !== userId);
                                  setSelectedUserIds(employeeIds);
                                } else {
                                  setSelectedUserIds([]);
                                }
                                setProjectSearch('');
                              }}
                              className={`w-full text-left px-3 py-2 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/30 transition ${
                                isSelected ? 'bg-blue-600/20' : ''
                              }`}
                            >
                              <div className="text-sm font-medium text-white">{projectName}</div>
                              {p.description && (
                                <div className="text-xs text-gray-400 truncate">
                                  {p.description}
                                </div>
                              )}
                              {Array.isArray(p.employees) && p.employees.length > 0 && (
                                <div className="text-xs text-blue-400 mt-1">
                                  {p.employees.length} employee{p.employees.length !== 1 ? 's' : ''}{' '}
                                  assigned
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                  {selectedProject && (
                    <div className="mt-2 flex items-center gap-2 px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-sm">
                      <span className="text-white">{selectedProject.name || selectedProject.projectName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                        onClick={() => {
                          setSelectedProject(null);
                          setGroupName('');
                          setSelectedUserIds([]);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Group name</div>
                  <Input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder={
                      selectedProject ? 'Group name (pre-filled from project)' : 'Team name'
                    }
                    disabled={!!selectedProject}
                    className="h-9 bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Avatar URL (optional)</div>
                  <Input
                    value={groupAvatar}
                    onChange={(e) => setGroupAvatar(e.target.value)}
                    placeholder="https://..."
                    className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-2">Select members</div>
                  <div className="max-h-64 overflow-auto border border-gray-700 rounded-md bg-[#0f1419]">
                    {allUsers
                      ?.filter((u) => u._id !== userId)
                      .map((u) => (
                        <label
                          key={u._id}
                          className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/30"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(u._id)}
                            onChange={() => toggleSelected(u._id)}
                            className="accent-blue-600"
                          />
                          <span className="text-sm text-white">
                            {u.name} <span className="text-gray-400">({u.email})</span>
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 flex justify-end gap-2 shrink-0">
                <Button variant="ghost" onClick={() => setGroupModalOpen(false)} className="text-gray-300 hover:text-white hover:bg-gray-700">
                  Cancel
                </Button>
                <Button onClick={handleCreateGroup} disabled={creatingGroup} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {creatingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit group modal */}
        {editGroupModalOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setEditGroupModalOpen(false)}
            />
            <div className="absolute inset-0 m-auto w-[95%] max-w-xl h-fit bg-[#1e2339] rounded-lg shadow-xl overflow-hidden border border-gray-700">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="font-semibold text-white">Edit group</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => setEditGroupModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Group name</div>
                  <Input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Team name"
                    className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Avatar URL (optional)</div>
                  <Input
                    value={groupAvatar}
                    onChange={(e) => setGroupAvatar(e.target.value)}
                    placeholder="https://..."
                    className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-2">Members</div>
                  <div className="max-h-64 overflow-auto border border-gray-700 rounded-md bg-[#0f1419]">
                    {allUsers
                      ?.filter((u) => u._id !== userId)
                      .map((u) => (
                        <label
                          key={u._id}
                          className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/30"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(u._id)}
                            onChange={() => toggleSelected(u._id)}
                            className="accent-blue-600"
                          />
                          <span className="text-sm text-white">
                            {u.name} <span className="text-gray-400">({u.email})</span>
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditGroupModalOpen(false)} className="text-gray-300 hover:text-white hover:bg-gray-700">
                  Cancel
                </Button>
                <Button onClick={handleSaveEditGroup} disabled={savingEditGroup} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {savingEditGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <Dialog
          open={membersDialogOpen}
          onOpenChange={(open) => {
            setMembersDialogOpen(open);
            if (!open) {
              setGroupMembers([]);
            }
          }}
        >
          <DialogContent className="max-w-lg rounded-2xl border border-gray-700 bg-[#1e2339] shadow-xl z-1000001">
            <DialogHeader>
              <DialogTitle className="text-white">
                {activeChat?.isGroupChat
                  ? activeChat?.chatName || 'Group participants'
                  : 'Participant'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {activeChat?.isGroupChat
                  ? `${groupMembers.length} participant${groupMembers.length === 1 ? '' : 's'}`
                  : 'This is the person you are chatting with.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {groupMembersLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading members...
                </div>
              ) : groupMembers.length > 0 ? (
                groupMembers.map((member) => {
                  const adminId =
                    typeof activeChat?.groupAdmin === 'object'
                      ? activeChat?.groupAdmin?._id
                      : activeChat?.groupAdmin;
                  const isAdmin = String(adminId) === String(member?._id);
                  const isYou = String(member?._id) === String(userId);
                  return (
                    <div
                      key={member?._id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-700 px-4 py-3 bg-[#0f1419]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                          {(member?.name || member?.email || member?.phone || '?')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">
                              {member?.name || member?.email || member?.phone || 'Unnamed user'}
                            </span>
                            {isYou && (
                              <span className="text-[11px] uppercase tracking-wide text-emerald-400 font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          {member?.email && (
                            <div className="text-xs text-gray-400 truncate">{member.email}</div>
                          )}
                          {member?.phone && (
                            <div className="text-xs text-gray-400 truncate">{member.phone}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-[11px] font-semibold uppercase tracking-wide text-blue-400">
                        {isAdmin ? <span>Admin</span> : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-400">No members found for this chat.</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={confirmDeleteOpen}
          onOpenChange={(open) => {
            if (deleteLoading) return;
            setConfirmDeleteOpen(open);
          }}
        >
          <AlertDialogContent className="max-w-md rounded-2xl border border-gray-700 bg-[#1e2339] shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete this chat?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This will permanently remove{' '}
                {activeChat?.isGroupChat
                  ? activeChat?.chatName || 'this group chat'
                  : 'this conversation'}{' '}
                for all participants.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel
                className="border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-[#0f1419] rounded-xl"
                disabled={deleteLoading}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteChat}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete chat'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
