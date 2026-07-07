"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookOpen, Calendar, Plus, Trash2, Users, CheckCircle, Video, Mic, FileText, LayoutDashboard, UserCircle, Save, Briefcase, GraduationCap, Loader2, Edit, Brain, Sparkles, Paperclip, Download, Image as ImageIcon } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingYoutube, setFetchingYoutube] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  // State for AI Generator File Upload
  const [aiUploadFile, setAiUploadFile] = useState<File | null>(null);
  
  // State for Home & Profile Image Uploads
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [aboutData, setAboutData] = useState({ title: "", description: "", image_url: "" });
  const [heroData, setHeroData] = useState({ title: "", description: "", image_url: "" });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [aiTarget, setAiTarget] = useState("courses");
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiStep, setAiStep] = useState("");

  const defaultForm = { title: "", description: "", status: "Upcoming", price: "", date: "", location: "", image_url: "", youtube_id: "", duration: "", event: "", tech_stack: "", company: "", role: "", institution: "", degree: "", years: "", youtube_url: "", link: "", content: "", file_url: "", file_name: "" };
  const [formData, setFormData] = useState(defaultForm);

  const menuItems = [
    { id: "requests", label: "Student Requests", icon: Users },
    { id: "ai_generator", label: "✨ AI Auto-Generator", icon: Sparkles },
    { id: "ai_knowledge", label: "AI Knowledge Base", icon: Brain },
    { id: "about", label: "Page Headers & Images", icon: UserCircle },
    { id: "experience", label: "Work Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "workshops", label: "Workshops", icon: Calendar },
    { id: "video_courses", label: "Video Courses", icon: Video },
    { id: "talks", label: "Talks & Keynotes", icon: Mic },
    { id: "blog", label: "Blog & Articles", icon: FileText },
    { id: "projects", label: "Projects", icon: LayoutDashboard },
  ];

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === "about") {
      const { data: aboutRes } = await supabase.from("site_content").select("*").eq("id", "about_bio").single();
      if (aboutRes) setAboutData({ title: aboutRes.title, description: aboutRes.description, image_url: aboutRes.image_url });
      
      const { data: heroRes } = await supabase.from("site_content").select("*").eq("id", "home_hero").single();
      if (heroRes) setHeroData({ title: heroRes.title, description: heroRes.description, image_url: heroRes.image_url });
    } else if (activeTab !== "ai_generator") {
      const { data: result, error } = await supabase.from(activeTab).select("*").order("created_at", { ascending: false });
      if (error) setData([]); else if (result) setData(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkSecurity = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.push("/login");
      else if (data.session.user.email !== "varazdat.platform@hotmail.com") { alert("Unauthorized Access."); router.push("/"); }
      else fetchData();
    };
    checkSecurity();
  }, [activeTab]);

  const handleSaveAbout = async () => {
    setLoading(true);
    let finalHeroUrl = heroData.image_url;
    let finalProfileUrl = aboutData.image_url;

    if (heroImageFile) {
      const fileName = `hero_${Math.random()}.${heroImageFile.name.split('.').pop()}`;
      await supabase.storage.from('images').upload(fileName, heroImageFile);
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      finalHeroUrl = data.publicUrl;
    }

    if (profileImageFile) {
      const fileName = `profile_${Math.random()}.${profileImageFile.name.split('.').pop()}`;
      await supabase.storage.from('images').upload(fileName, profileImageFile);
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      finalProfileUrl = data.publicUrl;
    }

    await supabase.from("site_content").upsert({ id: "about_bio", title: aboutData.title, description: aboutData.description, image_url: finalProfileUrl });
    await supabase.from("site_content").upsert({ id: "home_hero", title: heroData.title, description: heroData.description, image_url: finalHeroUrl });
    
    setHeroImageFile(null);
    setProfileImageFile(null);
    alert("Page Headers & Images Updated Successfully!");
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    await supabase.from(activeTab).delete().eq("id", id);
    fetchData();
  };

  const handleEdit = (row: any) => { setFormData({ ...defaultForm, ...row }); setEditingId(row.id); setIsModalOpen(true); };

  // Student Request Approvals
  const handleApprove = async (id: string) => {
    await supabase.from("requests").update({ status: "Awaiting Payment" }).eq("id", id);
    fetchData(); 
  };
  const handleReject = async (id: string) => {
    await supabase.from("requests").update({ status: "Rejected" }).eq("id", id);
    fetchData();
  };

  const handleYoutubeUrlChange = async (url: string) => {
    setFormData({ ...formData, youtube_url: url });
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    if (videoId) {
      setFetchingYoutube(true);
      try {
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await response.json();
        setFormData(prev => ({ ...prev, youtube_id: videoId, title: data.title || prev.title }));
      } catch (e) { setFormData(prev => ({ ...prev, youtube_id: videoId })); }
      setFetchingYoutube(false);
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    let finalFileUrl = formData.file_url;
    let finalFileName = formData.file_name;

    if (activeTab === "ai_knowledge" && uploadFile) {
      const fileName = `${Math.random()}.${uploadFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('knowledge_files').upload(fileName, uploadFile);
      if (!uploadError) {
        finalFileUrl = supabase.storage.from('knowledge_files').getPublicUrl(fileName).data.publicUrl;
        finalFileName = uploadFile.name;
      }
    }

    let payload: any = {};
    switch (activeTab) {
      case "ai_knowledge": payload = { title: formData.title, content: formData.content, file_url: finalFileUrl, file_name: finalFileName }; break;
      case "experience": payload = { company: formData.company, role: formData.role, duration: formData.duration, description: formData.description }; break;
      case "education": payload = { institution: formData.institution, degree: formData.degree, years: formData.years }; break;
      case "video_courses": payload = { title: formData.title, youtube_id: formData.youtube_id }; break;
      case "talks":
      case "blog": payload = { title: formData.title, date: formData.date, description: formData.description, image_url: formData.image_url }; break;
      case "projects": payload = { title: formData.title, role: formData.role, link: formData.link, tech_stack: formData.tech_stack, description: formData.description, image_url: formData.image_url }; break;
      case "courses": payload = { title: formData.title, status: formData.status, description: formData.description, price: formData.price, start_date: formData.date, location: formData.location, image_url: formData.image_url }; break;
      case "workshops": payload = { title: formData.title, status: formData.status, description: formData.description, date: formData.date, location: formData.location, image_url: formData.image_url }; break;
    }

    if (editingId) await supabase.from(activeTab).update(payload).eq("id", editingId);
    else await supabase.from(activeTab).insert([payload]);
    
    setIsUploading(false); setIsModalOpen(false); setEditingId(null); setUploadFile(null); setFormData(defaultForm); fetchData();
  };

  const handleAIProcess = async () => {
    if (!aiUploadFile) {
      alert("Please select a file first.");
      return;
    }

    setAiProcessing(true); 
    
    try {
      // Step 1: Upload to Supabase Storage
      setAiStep("Uploading file to Supabase...");
      const fileName = `ai_source_${Date.now()}_${aiUploadFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('knowledge_files')
        .upload(fileName, aiUploadFile);

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('knowledge_files')
        .getPublicUrl(fileName);

      // Step 2: Send URL to our backend to read PDF and push to Botpress
      setAiStep("Extracting text and sending to Botpress...");
      const res = await fetch("/api/process-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: publicUrl, fileName: aiUploadFile.name })
      });

      if (!res.ok) throw new Error("Failed to process document");

      // Step 3: Format the data for the UI Modal
      setAiStep("Formatting data...");
      setFormData({ 
        ...defaultForm, 
        title: `AI Generated ${aiTarget.replace("_", " ")}`, 
        description: "Automatically extracted from the uploaded document.", 
        price: aiTarget === "courses" ? "$250" : "", 
        date: "TBD", 
        location: "Online", 
        image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80" 
      });
      
      setActiveTab(aiTarget); 
      setIsModalOpen(true);
      setAiUploadFile(null); // Clear the file input

    } catch (error) {
      console.error(error);
      alert("There was an error processing the file.");
    } finally {
      setAiProcessing(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#020202]">
      
      {/* SIDEBAR */}
      <div className="w-64 border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#050505] p-6 hidden md:block overflow-y-auto">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"}`}>
              <item.icon size={18} className={item.id === "ai_generator" ? "text-purple-500" : ""}/> {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-8 h-[calc(100vh-4rem)] overflow-y-auto">
        
        {/* AI GENERATOR */}
        {activeTab === "ai_generator" && (
           <div className="max-w-3xl">
             <h1 className="text-3xl font-bold flex items-center gap-3 mb-2"><Sparkles className="text-purple-500" /> AI Content Auto-Generator</h1>
             <p className="text-gray-500 mb-8">Upload a PDF. The AI will extract the details and prepare it for your database.</p>
             <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-8 shadow-sm">
               <div className="mb-6">
                 <label className="block text-sm font-bold mb-2">1. What are we creating?</label>
                 <select value={aiTarget} onChange={e => setAiTarget(e.target.value)} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:border-navy cursor-pointer">
                   <option value="courses">A Course</option><option value="workshops">A Workshop</option><option value="talks">A Keynote Talk</option><option value="blog">A Blog Article</option><option value="projects">A Project Case Study</option>
                 </select>
               </div>
               <div className="mb-8">
                 <label className="block text-sm font-bold mb-2">2. Provide the Source Material</label>
                 <div className="w-full p-8 rounded-xl border-2 border-dashed border-black/20 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-center transition-colors hover:border-navy">
                   <input 
                     type="file" 
                     id="ai-file-upload" 
                     accept=".pdf,.doc,.docx,.txt" 
                     className="hidden" 
                     onChange={(e) => setAiUploadFile(e.target.files ? e.target.files[0] : null)}
                   />
                   <label htmlFor="ai-file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-navy transition-colors">
                     <Paperclip size={32} />
                     <span className="font-medium text-lg">
                       {aiUploadFile ? aiUploadFile.name : "Click to upload PDF or Word Doc"}
                     </span>
                   </label>
                 </div>
               </div>
               <button onClick={handleAIProcess} disabled={aiProcessing} className="w-full py-4 bg-gradient-to-r from-navy to-purple-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-3 disabled:opacity-70">
                 {aiProcessing ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />} {aiProcessing ? aiStep : "✨ Generate with AI"}
               </button>
             </div>
           </div>
        )}

        {/* ABOUT PAGE EDITOR WITH FILE UPLOADS */}
        {activeTab === "about" && (
          <div className="space-y-8 max-w-3xl">
            <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Home Page Hero</h3>
              <div className="space-y-6">
                <div><label className="block text-sm font-medium mb-2 text-gray-500">Main Title (Last 2 words turn blue)</label><input type="text" value={heroData.title} onChange={e => setHeroData({...heroData, title: e.target.value})} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:border-navy" /></div>
                <div><label className="block text-sm font-medium mb-2 text-gray-500">Short Description</label><textarea rows={3} value={heroData.description} onChange={e => setHeroData({...heroData, description: e.target.value})} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:border-navy"></textarea></div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Home Image</label>
                  <div className="w-full p-4 rounded-xl border-2 border-dashed border-black/20 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-center">
                    <input type="file" id="hero-img-upload" accept="image/*" className="hidden" onChange={(e) => setHeroImageFile(e.target.files ? e.target.files[0] : null)} />
                    <label htmlFor="hero-img-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-navy transition-colors">
                      <ImageIcon size={24} />
                      <span className="text-sm font-medium">{heroImageFile ? heroImageFile.name : "Click to upload a new Image"}</span>
                    </label>
                  </div>
                  {heroData.image_url && !heroImageFile && <p className="text-xs text-green-500 mt-2">Current image is active.</p>}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6">About Page Profile</h3>
              <div className="space-y-6">
                <div><label className="block text-sm font-medium mb-2 text-gray-500">Name / Title</label><input type="text" value={aboutData.title} onChange={e => setAboutData({...aboutData, title: e.target.value})} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:border-navy" /></div>
                <div><label className="block text-sm font-medium mb-2 text-gray-500">Biography</label><textarea rows={4} value={aboutData.description} onChange={e => setAboutData({...aboutData, description: e.target.value})} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:border-navy"></textarea></div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Profile Image</label>
                  <div className="w-full p-4 rounded-xl border-2 border-dashed border-black/20 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-center">
                    <input type="file" id="profile-img-upload" accept="image/*" className="hidden" onChange={(e) => setProfileImageFile(e.target.files ? e.target.files[0] : null)} />
                    <label htmlFor="profile-img-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-navy transition-colors">
                      <ImageIcon size={24} />
                      <span className="text-sm font-medium">{profileImageFile ? profileImageFile.name : "Click to upload a new Headshot"}</span>
                    </label>
                  </div>
                  {aboutData.image_url && !profileImageFile && <p className="text-xs text-green-500 mt-2">Current image is active.</p>}
                </div>
              </div>
            </div>

            <button onClick={handleSaveAbout} disabled={loading} className="w-full flex justify-center items-center gap-2 bg-navy text-white px-6 py-4 rounded-xl font-bold hover:bg-navy-dark transition-colors shadow-lg">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Uploading & Saving..." : <><Save size={18} /> Save All Page Changes</>}
            </button>
          </div>
        )}

        {/* DATA TABLES */}
        {activeTab !== "about" && activeTab !== "ai_generator" && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div><h1 className="text-3xl font-bold capitalize">{activeTab.replace("_", " ")}</h1><p className="text-gray-500 mt-1">Manage your platform content dynamically.</p></div>
              {activeTab !== "requests" && <button onClick={() => { setFormData(defaultForm); setEditingId(null); setUploadFile(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-xl font-medium hover:bg-navy-dark transition-colors shadow-lg"><Plus size={18} /> Add New</button>}
            </div>
            <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
              {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : data.length === 0 ? <div className="p-8 text-center text-gray-500">No entries found.</div> : (
                <table className="w-full text-left border-collapse">
                  <thead><tr className="border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-500"><th className="p-4 font-medium">Header</th><th className="p-4 font-medium">Details</th><th className="p-4 font-medium text-right">Actions</th></tr></thead>
                  <tbody>
                    {data.map((row) => (
                      <tr key={row.id} className="border-b border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium text-navy dark:text-blue-400">{row.title || row.company || row.institution || row.user_email}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400 text-sm max-w-xs truncate">
                          {activeTab === "ai_knowledge" && row.file_url ? <a href={row.file_url} target="_blank" className="flex items-center gap-1 text-blue-500 hover:underline"><Download size={14}/> {row.file_name}</a> : <>{row.role || row.degree || row.status || row.date || row.tech_stack || row.youtube_id || row.content || "No extra details"}{row.duration || row.years ? ` (${row.duration || row.years})` : ""}</>}
                        </td>
                        <td className="p-4 flex justify-end gap-2">
                          {activeTab === "requests" && row.status === "Pending" && (
                            <div className="flex gap-2">
                              <button onClick={() => handleApprove(row.id)} className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-bold">Approve</button>
                              <button onClick={() => handleReject(row.id)} className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-bold">Reject</button>
                            </div>
                          )}
                          {activeTab !== "requests" && <button onClick={() => handleEdit(row)} className="p-2 text-navy hover:text-navy-dark transition-colors"><Edit size={16} /></button>}
                          <button onClick={() => handleDelete(row.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* DYNAMIC MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 capitalize">{editingId ? "Edit" : "Add New"} {activeTab.replace("_", " ")}</h2>
            <div className="space-y-4">
              {activeTab === "ai_knowledge" && (
                <><input type="text" placeholder="Document Name" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" /><div className="w-full p-4 rounded-xl border-2 border-dashed border-black/20 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-center"><input type="file" id="file-upload" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)} /><label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-navy transition-colors"><Paperclip size={24} /><span className="text-sm font-medium">{uploadFile ? uploadFile.name : formData.file_name ? `Current file: ${formData.file_name}` : "Upload PDF or Word Doc"}</span></label></div><textarea placeholder="Paste plain text..." rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none"></textarea></>
              )}
              {activeTab === "video_courses" && (
                <div className="relative"><input type="text" placeholder="Paste full YouTube Link..." value={formData.youtube_url} onChange={e => handleYoutubeUrlChange(e.target.value)} className="w-full p-3 pr-10 rounded-xl border border-black/20 bg-transparent outline-none focus:border-navy" />{fetchingYoutube && <Loader2 className="absolute right-3 top-3 animate-spin text-navy" size={20} />}{formData.youtube_id && !fetchingYoutube && <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />}</div>
              )}
              {activeTab === "experience" && (
                <><input type="text" placeholder="Company" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" /><input type="text" placeholder="Role / Job Title" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" /><input type="text" placeholder="Duration" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" /></>
              )}
              {activeTab === "education" && (
                <><input type="text" placeholder="Institution" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" /><input type="text" placeholder="Degree" value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" /><input type="text" placeholder="Years" value={formData.years} onChange={e => setFormData({...formData, years: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" /></>
              )}
              {activeTab !== "ai_knowledge" && activeTab !== "experience" && activeTab !== "education" && (
                <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" />
              )}
              {(activeTab === "courses" || activeTab === "workshops") && (
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none"><option value="Upcoming">Upcoming</option><option value="Active Now">Active Now</option><option value="Archived">Archived</option></select>
              )}
              {activeTab === "courses" && <input type="text" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" />}
              {activeTab === "projects" && (
                <><input type="text" placeholder="Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" /><input type="text" placeholder="Tech Stack" value={formData.tech_stack} onChange={e => setFormData({...formData, tech_stack: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" /><input type="text" placeholder="External Link" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" /></>
              )}
              {(activeTab === "talks" || activeTab === "workshops" || activeTab === "blog" || activeTab === "courses") && <input type="text" placeholder="Date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" />}
              {(activeTab === "courses" || activeTab === "workshops") && <input type="text" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" />}
              {activeTab !== "education" && activeTab !== "video_courses" && activeTab !== "ai_knowledge" && (
                <textarea placeholder="Description" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none"></textarea>
              )}
              {(activeTab === "courses" || activeTab === "workshops" || activeTab === "blog" || activeTab === "projects") && <input type="text" placeholder="Image URL (https://...)" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full p-3 rounded-xl border border-black/20 bg-transparent outline-none" />}
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => {setIsModalOpen(false); setEditingId(null); setUploadFile(null); setFormData(defaultForm);}} className="px-5 py-2 text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl transition-colors font-medium">Cancel</button>
              <button onClick={handleSave} disabled={isUploading} className="flex items-center gap-2 px-5 py-2 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors font-medium shadow-lg disabled:bg-gray-400">
                {isUploading && <Loader2 size={16} className="animate-spin" />} {isUploading ? "Uploading..." : editingId ? "Update Changes" : "Save to Database"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
