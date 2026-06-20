'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GroupChat from '@/components/GroupChat';
import { EmptyState, Skeleton } from '@/components/ui';
import { Loader2, Users, FileText, Lock, Globe, UserPlus, LogOut, ChevronLeft, ArrowRight, Plus, X, Image as ImageIcon, Camera, Send, Video, Trash2, Search, Mail, MessageCircle, PenLine } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isPublic: boolean;
  category: string | null;
  createdAt: string;
  _count: { members: number; posts: number };
  isMember: boolean;
  memberRole: string | null;
  members: {
    id: string;
    role: string;
    joinedAt: string;
    user: { id: string; name: string | null; avatar: string | null };
  }[];
}

interface GroupPost {
  id: string;
  content: string;
  images: string[] | null;
  video: string | null;
  createdAt: string;
  userId: string;
  user: { id: string; name: string | null; avatar: string | null } | null;
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'chat' | 'members'>('chat');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postVideo, setPostVideo] = useState<string>('');
  const [postVideoThumbnail, setPostVideoThumbnail] = useState<string>('');
  const [postLoading, setPostLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  // Invitation states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string | null; avatar: string | null; email: string | null }>>([]);
  const [inviteSearchLoading, setInviteSearchLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState('');

  // Fetch all users when invite modal opens
  useEffect(() => {
    if (!showInviteModal) return;
    const fetchAllUsers = async () => {
      setInviteSearchLoading(true);
      try {
        const res = await fetch('/api/users?limit=200');
        if (res.ok) {
          const data = await res.json();
          const memberIds = new Set(group?.members.map((m) => m.user.id) || []);
          const filtered = (data.users || []).filter((u: any) => !memberIds.has(u.id));
          setAllUsers(filtered);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setInviteSearchLoading(false);
      }
    };
    fetchAllUsers();
  }, [showInviteModal, group?.members]);

  useEffect(() => {
    if (!id) return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchGroup();
      fetchPosts(1);
    }
  }, [id, status]);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${id}`);
      if (res.ok) {
        const data = await res.json();
        setGroup(data.group);
      } else if (res.status === 404) {
        router.push('/groups');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (pageNum: number) => {
    try {
      const res = await fetch(`/api/groups/${id}/posts?page=${pageNum}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        if (pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async () => {
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }
    setJoinLoading(true);
    try {
      const res = await fetch(`/api/groups/${id}/members`, { method: 'POST' });
      if (res.ok) {
        fetchGroup();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeave = async () => {
    const ok = await confirm({ title: 'هل أنت متأكد من مغادرة المجموعة؟' });
    if (!ok) return;
    setJoinLoading(true);
    try {
      const res = await fetch(`/api/groups/${id}/members/${session?.user?.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchGroup();
        setPosts([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setJoinLoading(false);
    }
  };

  const inviteSearchResults = inviteSearchQuery.trim()
    ? allUsers.filter((u) =>
        (u.name?.toLowerCase() || '').includes(inviteSearchQuery.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(inviteSearchQuery.toLowerCase())
      )
    : allUsers;

  const handleInviteUser = async (targetUserId: string) => {
    setInviteError('');
    setInviteLoading(targetUserId);
    try {
      const res = await fetch(`/api/groups/${id}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId }),
      });
      if (res.ok) {
        setAllUsers((prev) => prev.filter((u) => u.id !== targetUserId));
      } else {
        const data = await res.json().catch(() => ({ error: 'فشل في إرسال الدعوة' }));
        setInviteError(data.error || 'فشل في إرسال الدعوة');
      }
    } catch (e) {
      console.error(e);
      setInviteError('فشل الاتصال بالخادم');
    } finally {
      setInviteLoading(null);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('يرجى اختيار صورة بصيغة JPEG, PNG, WebP, أو GIF', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت', 'error');
      return;
    }
    if (postImages.length >= 5) {
      showToast('يمكنك رفع 5 صور كحد أقصى', 'error');
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setPostImages((prev) => [...prev, data.url]);
      } else {
        showToast(data.error || 'فشل في رفع الصورة', 'error');
      }
    } catch {
      showToast('فشل في رفع الصورة', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/avi'];
    if (!allowedTypes.includes(file.type)) {
      showToast('يرجى اختيار فيديو بصيغة MP4, MOV, WebM, أو AVI', 'error');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      showToast('حجم الفيديو يجب أن لا يتجاوز 50 ميجابايت', 'error');
      return;
    }
    if (postVideo) {
      showToast('يمكنك رفع فيديو واحد فقط لكل منشور', 'error');
      return;
    }
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setPostVideo(data.url);
        if (data.thumbnailUrl) setPostVideoThumbnail(data.thumbnailUrl);
      } else {
        showToast(data.error || 'فشل في رفع الفيديو', 'error');
      }
    } catch {
      showToast('فشل في رفع الفيديو', 'error');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      showToast('لم نتمكن من الوصول للكاميرا. تأكد من إعطاء الإذن.', 'error');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await handleImageUpload(file);
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && postImages.length === 0 && !postVideo) return;
    setPostLoading(true);
    try {
      const res = await fetch(`/api/groups/${id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent.trim() || undefined,
          images: postImages.length > 0 ? postImages : undefined,
          video: postVideo || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => [data.post, ...prev]);
        setPostContent('');
        setPostImages([]);
        setPostVideo('');
        setPostVideoThumbnail('');
        setShowCreatePost(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPostLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذا المنشور؟' });
    if (!ok) return;
    try {
      const res = await fetch(`/api/groups/${id}/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  const isAdmin = group?.memberRole === 'ADMIN';

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!group) return null;

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4">
          {/* Back */}
          <Link
            href="/groups"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary mb-3 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            المجموعات
          </Link>

          {/* Group Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden mb-4"
          >
            <div className="h-40 bg-gradient-to-r from-primary to-slate-600 relative">
              {group.image && (
                <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-foreground">{group.name}</h1>
                    {group.isPublic ? (
                      <Globe className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-foreground/80 leading-relaxed">{group.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {group._count.members} عضو
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {group._count.posts} منشور
                    </span>
                    {group.category && (
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                        {group.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {isAdmin && group.isMember && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      دعوة
                    </button>
                  )}
                  {group.isMember ? (
                    <button
                      onClick={handleLeave}
                      disabled={joinLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-100 text-foreground text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      {joinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                      مغادرة
                    </button>
                  ) : (
                    <button
                      onClick={handleJoin}
                      disabled={joinLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {joinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      انضمام
                    </button>
                  )}
                </div>
              </div>

              {/* Members Preview */}
              {Array.isArray(group.members) && group.members.length > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {group.members.slice(0, 5).map((m) => (
                      <img
                        key={m?.user?.id || m?.id || Math.random().toString()}
                        src={m?.user?.avatar || '/logo/favicon.svg'}
                        alt={m?.user?.name || ''}
                        className="w-8 h-8 rounded-full border-2 border-surface object-cover bg-surface"
                      />
                    ))}
                  </div>
                  <Link href={`/groups/${group.id}/members`} className="text-xs text-primary hover:text-primary-dark font-medium">
                    عرض كل الأعضاء
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden mb-4">
            <div className="flex items-center border-b border-border">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'text-primary border-primary'
                    : 'text-muted border-transparent hover:text-foreground'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                المحادثة
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'posts'
                    ? 'text-primary border-primary'
                    : 'text-muted border-transparent hover:text-foreground'
                }`}
              >
                <FileText className="w-4 h-4" />
                المنشورات
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'members'
                    ? 'text-primary border-primary'
                    : 'text-muted border-transparent hover:text-foreground'
                }`}
              >
                <Users className="w-4 h-4" />
                الأعضاء
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'chat' && (
                <>
                  {group.isMember ? (
                    <GroupChat groupId={group.id} members={Array.isArray(group.members) ? group.members : []} isAdmin={isAdmin} />
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-border">
                      <MessageCircle className="w-10 h-10 text-muted mx-auto mb-2" />
                      <p className="text-sm text-foreground">انضم للمجموعة للمشاركة في المحادثة</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {/* Create Post */}
                  {group.isMember && (
                    <>
                      {!showCreatePost ? (
                        <button
                          onClick={() => setShowCreatePost(true)}
                          className="w-full flex items-center gap-3 p-4 rounded-lg border border-border bg-surface hover:border-primary/30 hover:shadow-sm transition-all text-left shadow-sm"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Plus className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-foreground">نشر في المجموعة</div>
                            <div className="text-xs text-muted">شاركي أفكارك وصورك وفيديوهاتك</div>
                          </div>
                          <div className="flex items-center gap-2 text-muted">
                            <ImageIcon className="w-4 h-4" />
                            <Video className="w-4 h-4" />
                            <Camera className="w-4 h-4" />
                          </div>
                        </button>
                      ) : (
                        <form onSubmit={handleCreatePost} className="bg-surface rounded-lg border border-border shadow-sm p-5 space-y-4">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <PenLine className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-foreground">منشور جديد</span>
                                <p className="text-[11px] text-muted">شاركي أفكارك مع أعضاء المجموعة</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setShowCreatePost(false); setPostImages([]); setPostVideo(''); setPostVideoThumbnail(''); setPostContent(''); stopCamera(); }}
                              className="w-8 h-8 rounded-md hover:bg-slate-100 transition-colors flex items-center justify-center"
                              aria-label="إغلاق"
                            >
                              <X className="w-4 h-4 text-muted" />
                            </button>
                          </div>

                          {/* Textarea */}
                          <div className="relative">
                            <textarea
                              value={postContent}
                              onChange={(e) => setPostContent(e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 rounded-md border bg-surface border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
                              placeholder="ماذا تريدين مشاركته مع المجموعة؟"
                            />
                            <span className={`absolute left-3 bottom-2 text-[10px] ${postContent.length > 500 ? 'text-danger' : 'text-muted'}`}>
                              {postContent.length}/1000
                            </span>
                          </div>

                          {/* Image previews */}
                          {postImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {postImages.map((img, i) => (
                                <div key={i} className="relative group">
                                  <img src={img} alt="معاينة الصورة" className="w-20 h-20 rounded-lg object-cover border border-border" />
                                  <button
                                    type="button"
                                    onClick={() => setPostImages((prev) => prev.filter((_, idx) => idx !== i))}
                                    className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-danger text-white text-xs flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="حذف الصورة"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Video preview */}
                          {postVideo && (
                            <div className="relative group rounded-lg overflow-hidden border border-border bg-black">
                              <video
                                src={postVideo}
                                poster={postVideoThumbnail || undefined}
                                className="w-full max-h-64 object-contain"
                                controls
                              />
                              <button
                                type="button"
                                onClick={() => { setPostVideo(''); setPostVideoThumbnail(''); }}
                                className="absolute top-2 left-2 px-2 py-1 rounded-md bg-danger text-white text-xs font-medium flex items-center gap-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                                حذف الفيديو
                              </button>
                            </div>
                          )}

                          {/* Camera overlay */}
                          {showCamera && (
                            <div className="relative rounded-lg overflow-hidden border border-border bg-black">
                              <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
                              <canvas ref={canvasRef} className="hidden" />
                              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center gap-3">
                                <button
                                  type="button"
                                  onClick={stopCamera}
                                  className="px-4 py-2 rounded-md bg-white/20 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/30 transition-colors"
                                >
                                  إلغاء
                                </button>
                                <button
                                  type="button"
                                  onClick={capturePhoto}
                                  className="w-14 h-14 rounded-full bg-white border-4 border-white/30 flex items-center justify-center hover:scale-105 transition-transform"
                                  aria-label="التقاط صورة"
                                >
                                  <div className="w-10 h-10 rounded-full bg-danger" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Toolbar */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Upload image */}
                              <label className="relative cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  multiple
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    files.forEach((file) => handleImageUpload(file));
                                    e.target.value = '';
                                  }}
                                  disabled={uploadingImage || postImages.length >= 5 || !!postVideo}
                                />
                                <span className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                  uploadingImage || postImages.length >= 5 || !!postVideo
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}>
                                  {uploadingImage ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <ImageIcon className="w-3.5 h-3.5" />
                                  )}
                                  {uploadingImage ? 'جاري الرفع...' : `صورة ${postImages.length > 0 ? `(${postImages.length}/5)` : ''}`}
                                </span>
                              </label>

                              {/* Upload video */}
                              <label className="relative cursor-pointer">
                                <input
                                  type="file"
                                  accept="video/mp4,video/quicktime,video/webm,video/avi"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleVideoUpload(file);
                                    e.target.value = '';
                                  }}
                                  disabled={uploadingVideo || !!postVideo || postImages.length > 0}
                                />
                                <span className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                  uploadingVideo || !!postVideo || postImages.length > 0
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}>
                                  {uploadingVideo ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Video className="w-3.5 h-3.5" />
                                  )}
                                  {uploadingVideo ? 'جاري الرفع...' : 'فيديو'}
                                </span>
                              </label>

                              {/* Camera capture */}
                              <button
                                type="button"
                                onClick={startCamera}
                                disabled={showCamera || postImages.length >= 5 || !!postVideo}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                  showCamera || postImages.length >= 5 || !!postVideo
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                                aria-label="التقاط صورة بالكاميرا"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                كاميرا
                              </button>
                            </div>

                            <button
                              type="submit"
                              disabled={postLoading || (!postContent.trim() && postImages.length === 0 && !postVideo)}
                              className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-sm disabled:opacity-40 hover:bg-primary-dark transition-colors"
                            >
                              {postLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              نشر
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}

                  {/* Posts */}
                  {posts.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="لا توجد منشورات في هذه المجموعة بعد"
                      description={group.isMember ? 'كني أول من ينشر!' : undefined}
                      actionLabel={group.isMember ? 'نشر منشور' : undefined}
                      onAction={group.isMember ? () => setShowCreatePost(true) : undefined}
                    />
                  ) : (
                    <>
                      {posts.map((post) => (
                        <GroupPostCard
                          key={post.id}
                          post={post}
                          currentUserId={session?.user?.id}
                          isAdmin={isAdmin}
                          onDelete={handleDeletePost}
                        />
                      ))}
                      {hasMore && (
                        <div className="flex justify-center py-3">
                          <button
                            onClick={handleLoadMore}
                            className="px-5 py-2 rounded-md bg-surface border border-border text-sm text-foreground hover:bg-slate-50 transition-colors"
                          >
                            تحميل المزيد
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Private group not member */}
                  {!group.isPublic && !group.isMember && posts.length === 0 && (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-border">
                      <Lock className="w-8 h-8 text-muted mx-auto mb-2" />
                      <p className="text-sm text-foreground">هذه المجموعة خاصة. انضم لعرض المحتوى.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-3">
                  {Array.isArray(group.members) && group.members.map((member) => (
                    <Link
                      key={member?.user?.id || member?.id}
                      href={`/profile/${member?.user?.id || '#'}`}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      <img
                        src={member?.user?.avatar || '/logo/favicon.svg'}
                        alt={member?.user?.name || ''}
                        className="w-10 h-10 rounded-full object-cover border border-border bg-surface"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">{member?.user?.name || 'مستخدم'}</div>
                        <div className="text-xs text-muted">
                          {member?.role === 'ADMIN' ? 'مشرف' : 'عضو'} · انضمت {member?.joinedAt ? new Date(member.joinedAt).toLocaleDateString('ar-SA') : ''}
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-muted" />
                    </Link>
                  ))}
                  {Array.isArray(group.members) && group._count?.members > group.members.length && (
                    <Link
                      href={`/groups/${group.id}/members`}
                      className="block text-center text-sm text-primary hover:text-primary-dark font-medium py-2"
                    >
                      عرض كل الأعضاء ({group._count.members})
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">دعوة أعضاء جدد</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  value={inviteSearchQuery}
                  onChange={(e) => setInviteSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم أو الإيميل..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-md border bg-surface border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                />
                {inviteSearchLoading && (
                  <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted" />
                )}
              </div>

              {inviteError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600 text-center">
                  {inviteError}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted px-1">
                <span>
                  {inviteSearchLoading
                    ? 'جاري التحميل...'
                    : `${inviteSearchResults.length} مستخدم${inviteSearchResults.length !== 1 ? 'ين' : ''} متاح${inviteSearchResults.length !== 1 ? 'ين' : ''}`}
                </span>
                {inviteSearchQuery.trim() && (
                  <button
                    onClick={() => setInviteSearchQuery('')}
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    مسح البحث
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1">
                {inviteSearchLoading && inviteSearchResults.length === 0 && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                {!inviteSearchLoading && inviteSearchResults.length === 0 && (
                  <p className="text-center text-sm text-muted py-8">
                    {inviteSearchQuery.trim()
                      ? 'لا يوجد مستخدمون مطابقون'
                      : 'لا يوجد مستخدمون متاحون للدعوة'}
                  </p>
                )}
                {inviteSearchResults.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors">
                    <img
                      src={u.avatar || '/logo/favicon.svg'}
                      alt={u.name || ''}
                      className="w-10 h-10 rounded-full object-cover border border-border bg-surface flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{u.name || 'مستخدم'}</div>
                      <div className="text-xs text-muted truncate">{u.email}</div>
                    </div>
                    <button
                      onClick={() => handleInviteUser(u.id)}
                      disabled={inviteLoading === u.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {inviteLoading === u.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                      دعوة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <ConfirmDialog />
    </>
  );
}

function GroupPostCard({
  post,
  currentUserId,
  isAdmin,
  onDelete,
}: {
  post: GroupPost;
  currentUserId?: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}) {
  const images = Array.isArray(post.images) ? post.images : [];
  const isOwner = post.userId === currentUserId;

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `${Math.floor(diff / 60)} د`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} يوم`;
    return d.toLocaleDateString('ar-SA');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Link href={`/profile/${post.user?.id}`} className="flex items-center gap-2">
            <img
              src={post.user?.avatar || '/logo/favicon.svg'}
              alt={post.user?.name || ''}
              className="w-9 h-9 rounded-full object-cover border border-border bg-surface"
            />
            <div>
              <div className="font-semibold text-sm text-foreground">{post.user?.name || 'مستخدم'}</div>
              <div className="text-xs text-muted">{formatDate(post.createdAt)}</div>
            </div>
          </Link>
          {(isOwner || isAdmin) && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-xs text-danger hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
            >
              حذف
            </button>
          )}
        </div>
        {post.content && (
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
        )}
        {/* Video */}
        {post.video && (
          <div className="mt-3 rounded-lg overflow-hidden border border-border bg-black">
            <video
              src={post.video}
              controls
              className="w-full max-h-80 object-contain"
              preload="metadata"
            />
          </div>
        )}
        {/* Images */}
        {images.length > 0 && (
          <div className={`mt-3 grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {images.map((img, i) => (
              <img key={i} src={img} alt="محتوى المنشور" className={`w-full object-cover rounded-md ${images.length === 1 ? 'h-56' : 'h-40'}`} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
