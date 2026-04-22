import { useState, useEffect } from 'react'
import { 
  Star, 
  Layout, 
  Send, 
  ShieldCheck, 
  PlusCircle, 
  Heart, 
  CheckCircle2,
  ChevronLeft,
  Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE = 'https://feedback-grad-server.onrender.com/api'

interface FeedbackData {
  id?: number
  fullName: string
  studentId: string
  uiLayout: number
  uiEditor: number
  uiTestcase: number
  uiSubmission: number
  psychAutosave: string
  psychNetworkIssues: string
  psychProctoring: string
  wishlistFeatures: string[]
  wishlistCustomFeature: string
  wishlistFairness: string
  wishlistMessage: string
  npsScore: number
  adoptionWillingness: string
  created_at?: string
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(window.location.href.includes('admin'))
  const [step, setStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<FeedbackData>({
    fullName: '',
    studentId: '',
    uiLayout: 3,
    uiEditor: 3,
    uiTestcase: 3,
    uiSubmission: 3,
    psychAutosave: 'Có',
    psychNetworkIssues: '',
    psychProctoring: '',
    wishlistFeatures: [],
    wishlistCustomFeature: '',
    wishlistFairness: '',
    wishlistMessage: '',
    npsScore: 10,
    adoptionWillingness: 'Rất muốn'
  })

  useEffect(() => {
    const handleLocation = () => {
      setIsAdmin(window.location.href.includes('admin'))
    }
    window.addEventListener('popstate', handleLocation)
    // Also check on interval or hashchange for zero-router setups
    window.addEventListener('hashchange', handleLocation)
    return () => {
      window.removeEventListener('popstate', handleLocation)
      window.removeEventListener('hashchange', handleLocation)
    }
  }, [])

  // Server warm-up (wake up Render server)
  useEffect(() => {
    const warmup = async () => {
      try {
        console.log('Warming up server...')
        await axios.get(`${API_BASE}/ping`)
        console.log('Server is awake!')
      } catch (error) {
        console.error('Server warm-up failed', error)
      }
    }
    warmup()
  }, [])

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path)
    const event = new PopStateEvent('popstate')
    window.dispatchEvent(event)
  }

  const handleRating = (field: keyof FeedbackData, value: number) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleCheckbox = (feature: string) => {
    const updated = formData.wishlistFeatures.includes(feature)
      ? formData.wishlistFeatures.filter(f => f !== feature)
      : [...formData.wishlistFeatures, feature]
    setFormData({ ...formData, wishlistFeatures: updated })
  }

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_BASE}/feedback`, formData)
      setIsSubmitted(true)
    } catch (error) {
       console.error('Error submitting feedback', error)
       alert('Có lỗi xảy ra khi gửi khảo sát. Vui lòng thử lại sau.')
    }
  }

  if (isAdmin) return <AdminView onBack={() => navigateTo('/')} />

  const steps = [
    // Step 0: Basic Info
    (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Chào mừng bạn!</h2>
          <p className="text-slate-500">Vui lòng cung cấp thông tin để bắt đầu khảo sát</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Họ và tên</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Mã số sinh viên</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="24110001"
              value={formData.studentId}
              onChange={(e) => setFormData({...formData, studentId: e.target.value})}
            />
          </div>
        </div>
      </div>
    ),
    // Step 1: UI/UX
    (
      <div className="space-y-8">
        <SectionTitle icon={<Layout className="w-5 h-5"/>} title="Trải nghiệm Giao diện & Thao tác" subtitle="Đánh giá từ 1 (Rất tệ) đến 5 (Rất tốt)" />
        <div className="space-y-4">
          <RatingRow label="Bố cục màn hình (Layout)" description="Cách phân chia khu vực Đề thi và Code Editor" value={formData.uiLayout} onChange={(v) => handleRating('uiLayout', v)} />
          <RatingRow label="Trình soạn thảo Code" description="Highlight cú pháp, độ nhạy, tính dễ dùng" value={formData.uiEditor} onChange={(v) => handleRating('uiEditor', v)} />
          <RatingRow label="Độ rõ ràng của Testcase" description="Thông báo lỗi có giúp bạn dễ tìm ra sai sót" value={formData.uiTestcase} onChange={(v) => handleRating('uiTestcase', v)} />
          <RatingRow label="Trải nghiệm Nộp bài" description="Tốc độ chấm điểm và trả kết quả" value={formData.uiSubmission} onChange={(v) => handleRating('uiSubmission', v)} />
        </div>
      </div>
    ),
    // Step 2: Reliability
    (
      <div className="space-y-8">
        <SectionTitle icon={<ShieldCheck className="w-5 h-5"/>} title="Tâm lý & Độ tin cậy" subtitle="Sự ổn định của hệ thống trong quá trình thi" />
        <div className="space-y-6">
          <ChoiceRow 
            label="Cảm giác an toàn (Auto-save)" 
            description="Thông báo lưu nháp có giúp bạn yên tâm không?"
            choices={['Có', 'Không', 'Không để ý']}
            value={formData.psychAutosave}
            onChange={(v) => setFormData({...formData, psychAutosave: v})}
          />
          <TextAreaRow 
            label="Sự cố kỹ thuật" 
            description="Bạn có gặp lỗi mất mạng, lag không? Hệ thống xử lý thế nào?"
            value={formData.psychNetworkIssues}
            onChange={(v) => setFormData({...formData, psychNetworkIssues: v})}
          />
          <TextAreaRow 
            label="Cơ chế Giám sát (Proctoring)" 
            description="Tính năng cảnh báo thoát màn hình có gây áp lực thái quá?"
            value={formData.psychProctoring}
            onChange={(v) => setFormData({...formData, psychProctoring: v})}
          />
        </div>
      </div>
    ),
    // Step 3: Wishlist
    (
      <div className="space-y-8">
        <SectionTitle icon={<PlusCircle className="w-5 h-5"/>} title="Mong muốn & Đề xuất" subtitle="Giúp chúng mình hoàn thiện hệ thống tốt hơn" />
        <div className="space-y-6">
          <div>
            <label className="block font-semibold text-slate-800 mb-3">Tính năng bạn muốn có nhất?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Dark Mode', 'Format Code tự động', 'Lịch sử chạy thử', 'Auto-completion'].map(feature => (
                <button 
                  key={feature}
                  onClick={() => handleCheckbox(feature)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left group",
                    formData.wishlistFeatures.includes(feature) 
                      ? "bg-blue-50 border-blue-500 text-blue-700" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-all", formData.wishlistFeatures.includes(feature) ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-slate-400")}>
                    {formData.wishlistFeatures.includes(feature) && <CheckCircle2 className="w-3.5 h-3.5 text-white"/>}
                  </div>
                  <span className="text-sm font-semibold">{feature}</span>
                </button>
              ))}
            </div>
          </div>
          <TextAreaRow 
            label="Góc độ Công bằng" 
            description="Bạn mong muốn thêm luật gì để kỳ thi công bằng hơn?"
            value={formData.wishlistFairness}
            onChange={(v) => setFormData({...formData, wishlistFairness: v})}
          />
           <TextAreaRow 
            label="Lời nhắn gửi" 
            description="Bạn có góp ý gì thêm cho nhóm phát triển không?"
            value={formData.wishlistMessage}
            onChange={(v) => setFormData({...formData, wishlistMessage: v})}
          />
        </div>
      </div>
    ),
    // Step 4: Final NPS
    (
      <div className="space-y-8">
        <SectionTitle icon={<Heart className="w-5 h-5"/>} title="Đánh giá Tổng quan" subtitle="Cảm nhận cuối cùng về dự án" />
        <div className="space-y-10">
          <div>
            <label className="block text-center font-semibold text-slate-800 mb-6">Mức độ hài lòng chung (1-10)</label>
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button 
                  key={n}
                  onClick={() => setFormData({...formData, npsScore: n})}
                  className={cn(
                    "w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                    formData.npsScore === n 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" 
                      : "text-slate-500 hover:bg-white hover:text-slate-800"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-3 px-2 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              <span>Thoát thất vọng</span>
              <span>Rất hài lòng</span>
            </div>
          </div>

          <ChoiceRow 
            label="Áp dụng chính thức?" 
            description="Bạn có muốn trường áp dụng hệ thống này thay cách thi cũ?"
            choices={['Rất muốn', 'Có thể', 'Không bao giờ']}
            value={formData.adoptionWillingness}
            onChange={(v) => setFormData({...formData, adoptionWillingness: v})}
          />
        </div>
      </div>
    )
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-12 text-center space-y-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 relative overflow-hidden active-highlight"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto rotate-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-slate-900">Cảm ơn bạn!</h1>
            <p className="text-slate-500 leading-relaxed font-medium">Những ý kiến quý báu của bạn sẽ giúp nhóm phát triển hoàn thiện hệ thống hơn nữa.</p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              Gửi thêm phản hồi
            </button>
            <button 
              onClick={() => navigateTo('/admin')}
              className="text-slate-400 text-sm font-semibold hover:text-blue-600 transition-colors"
            >
               Xem các kết quả khảo sát khác (Quản trị)
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-16 px-6 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Abstract Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20">
            <Star className="w-3 h-3 fill-white" />
            Graduate Project Study
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl leading-tight">
            Khảo sát Hệ thống <br/>
            <span className="text-blue-600">Thi Thực Hành CSDL</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto leading-relaxed">
            Ý kiến của bạn là chìa khóa để kiến tạo một môi trường thi cử công bằng và công nghệ.
          </p>
        </header>

        {/* Progress Tracker */}
        <div className="mb-12">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
               <svg className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                <motion.circle 
                  cx="28" cy="28" r="24" fill="none" stroke="#2563eb" strokeWidth="6" 
                  strokeDasharray="150"
                  animate={{ strokeDashoffset: 150 - (150 * (step / (steps.length - 1))) }}
                  strokeLinecap="round"
                />
               </svg>
               <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{Math.round((step / (steps.length - 1)) * 100)}%</span>
            </div>
            <div className="min-w-0">
               <h3 className="font-bold text-slate-800">Bước {step + 1} / {steps.length}</h3>
               <p className="text-xs text-slate-400 font-medium truncate italic">"{['Thông tin cơ bản', 'Đánh giá UI/UX', 'Độ tin cậy hệ thống', 'Đề xuất nâng cấp', 'Cảm nghĩ chung'][step]}"</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100 rounded-[3rem]">
          <div className="p-8 sm:p-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {steps[step]}
              </motion.div>
            </AnimatePresence>

            <div className="mt-16 flex items-center justify-between gap-4">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className={cn(
                  "px-10 py-4 rounded-2xl font-bold transition-all",
                  step === 0 ? "opacity-0 pointer-events-none" : "hover:bg-slate-50 text-slate-400 hover:text-slate-800"
                )}
              >
                Quay lại
              </button>

              <button
                onClick={step === steps.length - 1 ? handleSubmit : () => setStep(s => s + 1)}
                disabled={(step === 0 && (!formData.fullName || !formData.studentId))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:shadow-blue-300 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-30 disabled:grayscale"
              >
                {step === steps.length - 1 ? (
                  <>Hoàn thành <Send className="w-4 h-4"/></>
                ) : (
                  <>Tiếp tục <CheckCircle2 className="w-4 h-4 opacity-50"/></>
                )}
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center">
            <p className="text-slate-400 text-sm font-medium">
              &copy; 2026 Nhóm Đồ Án Tốt Nghiệp. Made with ❤️ for Students.
            </p>
            <button 
              onClick={() => navigateTo('/admin')}
              className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-blue-500 transition-colors"
            >
              Quản trị viên
            </button>
        </footer>
      </div>
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-4 text-blue-600 mb-1">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
          {icon}
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
      </div>
      <p className="text-slate-400 text-sm font-medium pl-16">{subtitle}</p>
    </div>
  )
}

function RatingRow({ label, description, value, onChange }: { label: string, description: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-8 p-5 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all group">
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-slate-800">{label}</h4>
        <p className="text-[11px] text-slate-400 font-medium">{description}</p>
      </div>
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-inner border border-slate-50">
        {[1, 2, 3, 4, 5].map(star => (
          <button 
            key={star}
            onClick={() => onChange(star)}
            className="transition-all hover:scale-125 focus:outline-none"
          >
            <Star className={cn("w-6 h-6", star <= value ? "fill-blue-500 text-blue-500" : "text-slate-200 group-hover:text-slate-300")} />
          </button>
        ))}
      </div>
    </div>
  )
}

function ChoiceRow({ label, description, choices, value, onChange }: { label: string, description: string, choices: string[], value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-8 bg-blue-600 rounded-full" />
        <div>
          <h4 className="text-sm font-bold text-slate-800">{label}</h4>
          <p className="text-[11px] text-slate-400 font-medium">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {choices.map(choice => (
          <button 
            key={choice}
            onClick={() => onChange(choice)}
            className={cn(
              "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border",
              value === choice 
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-800"
            )}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}

function TextAreaRow({ label, description, value, onChange }: { label: string, description: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-4">
       <div className="flex items-center gap-2">
        <div className="w-1 h-8 bg-slate-200 rounded-full" />
        <div>
          <h4 className="text-sm font-bold text-slate-800">{label}</h4>
          <p className="text-[11px] text-slate-400 font-medium">{description}</p>
        </div>
      </div>
      <textarea 
        className="w-full h-32 bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-sm text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 focus:bg-white outline-none transition-all resize-none placeholder:text-slate-300 font-medium"
        placeholder="Chia sẻ giải pháp hoạc cảm ơn của bạn..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function AdminView({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<FeedbackData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${API_BASE}/feedback/all`)
        setItems(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-30 px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all">
          <ChevronLeft className="w-5 h-5" />
          Quay lại khảo sát
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-extrabold text-slate-900 tracking-tight">Cổng Quản Trị Khảo Sát</h2>
        </div>
      </nav>

      <div className="p-8 max-w-[1400px] mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div className="space-y-1">
             <h1 className="text-4xl font-extrabold text-slate-900">Danh sách phản hồi</h1>
             <p className="text-slate-500 font-medium">Tổng số {items.length} sinh viên đã tham gia khảo sát</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 px-6 py-4 rounded-3xl text-center">
             <span className="block text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">NPS Trung bình</span>
             <span className="text-3xl font-black text-blue-600">
               {(items.reduce((acc, curr: any) => acc + curr.nps_score, 0) / (items.length || 1)).toFixed(1)}
             </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-300">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="font-bold tracking-widest uppercase text-xs">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">
                  <th className="p-6">Sinh viên</th>
                  <th className="p-6">UI/UX (Avg)</th>
                  <th className="p-6">Auto-save</th>
                  <th className="p-6">Wishlist</th>
                  <th className="p-6">NPS</th>
                  <th className="p-6">Cảm nhận (Mở)</th>
                  <th className="p-6">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="font-extrabold text-slate-900">{item.full_name}</div>
                      <div className="text-xs text-slate-400 font-medium">#{item.student_id}</div>
                    </td>
                    <td className="p-6 font-bold text-slate-600">
                      {((item.ui_layout + item.ui_editor + item.ui_testcase + item.ui_submission) / 4).toFixed(1)} ⭐
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                        item.psych_autosave === 'Có' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {item.psych_autosave}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {item.wishlist_features?.map((f: string) => (
                          <span key={f} className="text-[9px] font-bold bg-white border px-2 py-0.5 rounded-md text-slate-400">{f}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "text-lg font-black",
                        item.nps_score >= 8 ? "text-blue-600" : "text-slate-400"
                      )}>{item.nps_score}</span>
                    </td>
                    <td className="p-6 max-w-[300px]">
                      <div className="text-xs text-slate-500 italic line-clamp-2" title={item.wishlist_message || 'Không có'}>
                        "{item.wishlist_message || 'Không có'}"
                      </div>
                    </td>
                    <td className="p-6 text-xs text-slate-400 font-medium">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
