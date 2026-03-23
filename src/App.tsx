import React, { useState } from 'react';
import { 
  Plus, ArrowLeft, Save, Calendar, MapPin, User, Activity, Bug, Droplet, 
  Beaker, Clock, ShieldAlert, Droplets, Scissors, Leaf, CloudRain, Sprout, 
  FlaskConical, BugOff, SprayCan, TreePine, Image as ImageIcon, X, LogOut, Lock, Phone,
  Trash2, Recycle, Package, ScanLine, Loader2, Home, ClipboardList, AlertTriangle, Settings, ShieldCheck, Warehouse, HardHat, Camera
} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

// Types
interface FarmLog {
  id: string;
  executor: string;
  stage: string;
  lot: string;
  datetime: string;
  task: string;
  pest: string;
  method: string;
  fertilizer: string;
  activeIngredient: string;
  dosage: string;
  quarantineTime: string;
  images?: string[];
  wasteType?: string;
  materialName?: string;
  materialQuantity?: string;
}

const USERS = [
  { phone: '0987654321', pin: '1234', name: 'Nguyễn Văn A' },
  { phone: '0123456789', pin: '1234', name: 'Trần Thị B' },
  { phone: '0999999999', pin: '0000', name: 'Quản trị viên' },
];

const STAGES = ['Trước Gieo Trồng', 'Phân hoá mầm hoa', 'Trước Thu Hoạch', 'Khác'];
const LOTS = ['Lô 1', 'Lô 2', 'Lô 3', 'Khác'];

const PREDEFINED_TASKS = [
  {
    id: 'rua_vuon',
    name: 'Rửa vườn',
    icon: Droplets,
    color: 'bg-blue-100 text-blue-600',
    requiresMaterials: true,
    defaultValues: { task: 'Rửa vườn', pest: 'Rêu', method: 'Champion', activeIngredient: 'Copper Hydroxide', dosage: '2kg / 1000 lít nước', quarantineTime: '7 Ngày' }
  },
  {
    id: 'cat_tia',
    name: 'Cắt tỉa cành',
    icon: Scissors,
    color: 'bg-gray-100 text-gray-600',
    requiresMaterials: false,
    defaultValues: { task: 'Cắt tỉa cành' }
  },
  {
    id: 'lam_co',
    name: 'Làm sạch cỏ',
    icon: Leaf,
    color: 'bg-green-100 text-green-600',
    requiresMaterials: false,
    defaultValues: { task: 'Làm sạch cỏ' }
  },
  {
    id: 'tuoi_nuoc',
    name: 'Tưới nước',
    icon: CloudRain,
    color: 'bg-cyan-100 text-cyan-600',
    requiresMaterials: false,
    defaultValues: { task: 'Tưới nước', dosage: '50lit/m2' }
  },
  {
    id: 'bon_phan_vi_sinh',
    name: 'Bón phân vi sinh',
    icon: Sprout,
    color: 'bg-lime-100 text-lime-600',
    requiresMaterials: true,
    defaultValues: { task: 'Bón phân vi sinh', fertilizer: 'Phân gà Nhật Bản' }
  },
  {
    id: 'bon_phan_lan',
    name: 'Bón phân Lân',
    icon: FlaskConical,
    color: 'bg-orange-100 text-orange-600',
    requiresMaterials: true,
    defaultValues: { task: 'Bón phân', fertilizer: 'Phân Lân Văn Điển', dosage: '2kg / 1 cây' }
  },
  {
    id: 'bon_phan_npk',
    name: 'Bón phân NPK',
    icon: FlaskConical,
    color: 'bg-amber-100 text-amber-600',
    requiresMaterials: true,
    defaultValues: { task: 'Bón phân', fertilizer: 'NPK 30-10-10', dosage: '1kg / cây' }
  },
  {
    id: 'phun_sau_ray_najat',
    name: 'Sâu Rầy (Najat)',
    icon: BugOff,
    color: 'bg-red-100 text-red-600',
    requiresMaterials: true,
    defaultValues: { task: 'Phun thuốc Sâu Rầy', pest: 'Sâu rầy', method: 'Najat 3.6', activeIngredient: 'Abamectin', dosage: '800ml/800L', quarantineTime: '7 Ngày' }
  },
  {
    id: 'phun_ray_xanh',
    name: 'Rầy xanh',
    icon: BugOff,
    color: 'bg-red-100 text-red-600',
    requiresMaterials: true,
    defaultValues: { task: 'Phun thuốc Sâu Rầy', pest: 'Rầy xanh', method: 'Bình Dân', activeIngredient: 'Abamectin', dosage: '800g/800L', quarantineTime: '7 Ngày' }
  },
  {
    id: 'phun_rep',
    name: 'Phun Rệp',
    icon: BugOff,
    color: 'bg-rose-100 text-rose-600',
    requiresMaterials: true,
    defaultValues: { task: 'Phun thuốc Sâu Rầy', pest: 'Rệp', method: 'Tado 4.0', activeIngredient: 'Picoxystrobin', dosage: '500ml / 600L' }
  },
  {
    id: 'phun_nhen_do',
    name: 'Phun Nhện đỏ',
    icon: SprayCan,
    color: 'bg-purple-100 text-purple-600',
    requiresMaterials: true,
    defaultValues: { task: 'Phun thuốc', pest: 'Nhện đỏ', method: 'Dipimai 150 EC', activeIngredient: 'Pyridaben', dosage: '2000ml / 800L nước', quarantineTime: '7 Ngày' }
  },
  {
    id: 'do_goc',
    name: 'Đổ gốc',
    icon: TreePine,
    color: 'bg-emerald-100 text-emerald-600',
    requiresMaterials: true,
    defaultValues: { task: 'Đổ gốc', method: 'Humic', activeIngredient: 'Axit Humic' }
  },
  {
    id: 'xu_ly_chat_thai',
    name: 'Xử lý chất thải',
    icon: Trash2,
    color: 'bg-stone-100 text-stone-600',
    requiresMaterials: false,
    defaultValues: { task: 'Xử lý chất thải', wasteType: 'Thu gom chất thải độc hại' }
  },
  {
    id: 'quan_ly_vat_tu',
    name: 'Quản lý vật tư',
    icon: Package,
    color: 'bg-indigo-100 text-indigo-600',
    requiresMaterials: false,
    defaultValues: { task: 'Quản lý vật tư' }
  },
  {
    id: 've_sinh_kho',
    name: 'Vệ sinh kho',
    icon: Warehouse,
    color: 'bg-teal-100 text-teal-600',
    requiresMaterials: false,
    defaultValues: { task: 'An toàn vệ sinh kho' }
  },
  {
    id: 'an_toan_lao_dong',
    name: 'An toàn lao động',
    icon: HardHat,
    color: 'bg-yellow-100 text-yellow-600',
    requiresMaterials: false,
    defaultValues: { task: 'An toàn lao động' }
  }
];

const TASKS = Array.from(new Set(PREDEFINED_TASKS.map(t => t.defaultValues.task)));

export default function App() {
  const [currentUser, setCurrentUser] = useState<{phone: string, name: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'diary' | 'report' | 'settings'>('diary');
  const [view, setView] = useState<'list' | 'add'>('list');
  const [selectedTaskConfig, setSelectedTaskConfig] = useState<typeof PREDEFINED_TASKS[0] | null>(null);
  
  const [logs, setLogs] = useState<FarmLog[]>([
    {
      id: '1',
      executor: 'Nguyen Van',
      stage: 'Trước Gieo Trồng',
      lot: 'Lô 1',
      datetime: '2026-02-07T12:00',
      task: 'Rửa vườn',
      pest: 'Rêu',
      method: 'Champion',
      fertilizer: '',
      activeIngredient: 'Copper Hydroxide',
      dosage: '2kg / 1000 lít nước',
      quarantineTime: '7 Ngày'
    },
    {
      id: '2',
      executor: 'Nguyen Van',
      stage: 'Trước Thu Hoạch',
      lot: 'Lô 2',
      datetime: '2027-02-07T12:00',
      task: 'Cắt tỉa cành',
      pest: '',
      method: '',
      fertilizer: '',
      activeIngredient: '',
      dosage: '',
      quarantineTime: ''
    },
    {
      id: '3',
      executor: 'Nguyen Van',
      stage: 'Phân hoá mầm hoa',
      lot: 'Lô 1',
      datetime: '2032-02-07T12:00',
      task: 'Bón phân',
      pest: '',
      method: '',
      fertilizer: 'Phân Lân Văn Điển',
      activeIngredient: '',
      dosage: '2kg / 1 cây',
      quarantineTime: ''
    }
  ]);

  const handleAddLog = (log: FarmLog) => {
    setLogs([log, ...logs]);
    setView('list');
  };

  const handleSelectTask = (taskConfig: typeof PREDEFINED_TASKS[0] | null) => {
    setSelectedTaskConfig(taskConfig);
    setView('add');
  };

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-emerald-600 text-white p-4 sticky top-0 z-10 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeTab === 'diary' && view === 'add' && (
            <button onClick={() => setView('list')} className="p-1 -ml-1 hover:bg-emerald-700 rounded-full">
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold">
            {activeTab === 'diary' ? 'Nhật Ký Canh Tác' : activeTab === 'report' ? 'Báo Cáo Sự Cố' : 'Cài Đặt'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium bg-emerald-700 px-3 py-1 rounded-full">{currentUser.name}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto pb-24">
        {activeTab === 'diary' && (
          view === 'list' ? (
            <>
              <div className="mb-6">
                <TaskGrid onSelectTask={handleSelectTask} />
              </div>
              
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Nhật ký gần đây</h2>
              </div>
              <LogList logs={logs} />
            </>
          ) : (
            <AddLogForm 
              initialData={selectedTaskConfig} 
              currentUser={currentUser}
              onSave={handleAddLog} 
              onCancel={() => setView('list')} 
            />
          )
        )}
        {activeTab === 'report' && <ReportScreen currentUser={currentUser} />}
        {activeTab === 'settings' && <SettingsScreen currentUser={currentUser} onLogout={() => setCurrentUser(null)} />}
      </main>

      {/* FAB for Add */}
      {activeTab === 'diary' && view === 'list' && (
        <button
          onClick={() => handleSelectTask(null)}
          className="fixed bottom-20 right-6 bg-emerald-600 text-white px-5 py-3.5 rounded-full shadow-lg hover:bg-emerald-700 active:scale-95 transition-transform flex items-center gap-2 font-medium z-20"
        >
          <Plus size={24} />
          Thêm nhật ký
        </button>
      )}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center pb-safe z-30">
        <button 
          onClick={() => { setActiveTab('diary'); setView('list'); }}
          className={`flex flex-col items-center py-3 px-6 gap-1 ${activeTab === 'diary' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <ClipboardList size={24} />
          <span className="text-[10px] font-medium">Nhật ký</span>
        </button>
        <button 
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center py-3 px-6 gap-1 ${activeTab === 'report' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <AlertTriangle size={24} />
          <span className="text-[10px] font-medium">Báo cáo</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center py-3 px-6 gap-1 ${activeTab === 'settings' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Settings size={24} />
          <span className="text-[10px] font-medium">Cài đặt</span>
        </button>
      </nav>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: {phone: string, name: string}) => void }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.phone === phone && u.pin === pin);
    if (user) {
      onLogin({ phone: user.phone, name: user.name });
    } else {
      setError('Số điện thoại hoặc mã PIN không đúng');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
            <Sprout size={40} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Nông Trại Xanh</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">Đăng nhập để ghi nhật ký canh tác</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="pl-10 w-full rounded-xl border-gray-300 border p-3 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã PIN</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="pl-10 w-full rounded-xl border-gray-300 border p-3 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Nhập mã PIN 4 số"
                maxLength={4}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 active:bg-emerald-800 transition-colors mt-6"
          >
            Đăng nhập
          </button>
        </form>
        
        <div className="mt-6 text-xs text-center text-gray-400">
          <p>Tài khoản dùng thử:</p>
          <p>0987654321 / 1234</p>
        </div>
      </div>
    </div>
  );
}

const TASK_CATEGORIES = [
  {
    id: 'cham_soc',
    name: 'Chăm sóc cơ bản',
    taskIds: ['tuoi_nuoc', 'lam_co', 'cat_tia', 'rua_vuon']
  },
  {
    id: 'dinh_duong',
    name: 'Phân bón & Dinh dưỡng',
    taskIds: ['bon_phan_vi_sinh', 'bon_phan_lan', 'bon_phan_npk', 'do_goc']
  },
  {
    id: 'phong_tru',
    name: 'Phòng trừ sâu bệnh',
    taskIds: ['phun_sau_ray_najat', 'phun_ray_xanh', 'phun_rep', 'phun_nhen_do']
  },
  {
    id: 'quan_ly',
    name: 'Quản lý chung',
    taskIds: ['xu_ly_chat_thai', 'quan_ly_vat_tu']
  },
  {
    id: 've_sinh_bao_ho',
    name: 'Vệ sinh & Bảo hộ',
    taskIds: ['ve_sinh_kho', 'an_toan_lao_dong']
  }
];

function TaskGrid({ onSelectTask }: { onSelectTask: (task: typeof PREDEFINED_TASKS[0] | null) => void }) {
  return (
    <div className="space-y-5">
      {TASK_CATEGORIES.map(category => (
        <div key={category.id}>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{category.name}</h2>
          <div className="grid grid-cols-4 gap-3">
            {category.taskIds.map(taskId => {
              const task = PREDEFINED_TASKS.find(t => t.id === taskId);
              if (!task) return null;
              const Icon = task.icon;
              return (
                <button
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="flex flex-col items-center justify-start gap-2 p-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <div className={`p-3 rounded-full ${task.color}`}>
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] sm:text-xs text-center font-medium leading-tight text-gray-700">{task.name}</span>
                </button>
              );
            })}
            {category.id === 'quan_ly' && (
              <button
                onClick={() => onSelectTask(null)}
                className="flex flex-col items-center justify-start gap-2 p-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <div className="p-3 rounded-full bg-gray-100 text-gray-600">
                  <Plus size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] sm:text-xs text-center font-medium leading-tight text-gray-700">Khác</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function LogList({ logs }: { logs: FarmLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        <p>Chưa có nhật ký nào.</p>
        <p>Bấm dấu + để thêm mới.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map(log => (
        <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-emerald-800">{log.task || 'Không tên công việc'}</h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
              {log.stage}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              <span>{new Date(log.datetime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" />
              <span>{log.lot}</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <User size={14} className="text-gray-400" />
              <span>{log.executor}</span>
            </div>
          </div>

          {(log.materialName || log.materialQuantity || log.wasteType || log.pest || log.method || log.fertilizer || log.activeIngredient || log.dosage || log.quarantineTime) && (
            <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5 text-sm">
              {log.materialName && <p><span className="text-gray-500">Vật tư:</span> {log.materialName}</p>}
              {log.activeIngredient && log.task === 'Quản lý vật tư' && <p><span className="text-gray-500">Hoạt chất:</span> {log.activeIngredient}</p>}
              {log.materialQuantity && <p><span className="text-gray-500">Số lượng:</span> {log.materialQuantity}</p>}
              {log.wasteType && <p><span className="text-gray-500">Loại xử lý:</span> {log.wasteType}</p>}
              {log.pest && <p><span className="text-gray-500">Đối tượng:</span> {log.pest}</p>}
              {log.method && <p><span className="text-gray-500">Biện pháp:</span> {log.method}</p>}
              {log.fertilizer && <p><span className="text-gray-500">Phân bón:</span> {log.fertilizer}</p>}
              {log.activeIngredient && log.task !== 'Quản lý vật tư' && <p><span className="text-gray-500">Hoạt chất:</span> {log.activeIngredient}</p>}
              {log.dosage && <p><span className="text-gray-500">Liều lượng:</span> {log.dosage}</p>}
              {log.quarantineTime && (
                <p className="text-amber-600 font-medium flex items-center gap-1 mt-1">
                  <ShieldAlert size={14} />
                  Cách ly: {log.quarantineTime}
                </p>
              )}
            </div>
          )}

          {log.images && log.images.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                {log.images.map((img, idx) => (
                  <img key={idx} src={img} alt="Log" className="h-20 w-20 object-cover rounded-lg border border-gray-200 snap-start shrink-0" />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AddLogForm({ initialData, currentUser, onSave, onCancel }: { initialData: typeof PREDEFINED_TASKS[0] | null, currentUser: {name: string}, onSave: (log: FarmLog) => void, onCancel: () => void }) {
  const defaultTask = initialData?.defaultValues?.task || '';
  const isTaskInList = TASKS.includes(defaultTask);
  
  const [isCustomTask, setIsCustomTask] = useState(!initialData || !isTaskInList);
  const [requiresMaterials, setRequiresMaterials] = useState(initialData ? initialData.requiresMaterials : true);
  const [isScanning, setIsScanning] = useState(false);
  
  const [formData, setFormData] = useState<Partial<FarmLog>>({
    executor: currentUser.name,
    stage: STAGES[0],
    lot: LOTS[0],
    datetime: new Date().toISOString().slice(0, 16),
    task: defaultTask || TASKS[0],
    pest: initialData?.defaultValues?.pest || '',
    method: initialData?.defaultValues?.method || '',
    fertilizer: initialData?.defaultValues?.fertilizer || '',
    activeIngredient: initialData?.defaultValues?.activeIngredient || '',
    dosage: initialData?.defaultValues?.dosage || '',
    quarantineTime: initialData?.defaultValues?.quarantineTime || '',
    wasteType: initialData?.defaultValues?.wasteType || 'Thu gom chất thải độc hại',
    materialName: '',
    materialQuantity: '',
    images: []
  });

  const handleScanMaterial = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsScanning(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise((resolve) => {
        reader.onload = resolve;
      });
      const base64Data = (reader.result as string).split(',')[1];
      const mimeType = file.type;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: 'Extract the material name (tên vật tư/thuốc/phân bón), active ingredient (hoạt chất), and quantity/volume (dung tích/khối lượng) from this image. Return JSON.',
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              materialName: { type: Type.STRING, description: 'Tên vật tư/thuốc/phân bón' },
              activeIngredient: { type: Type.STRING, description: 'Hoạt chất chính' },
              quantity: { type: Type.STRING, description: 'Dung tích hoặc khối lượng' },
            },
          },
        },
      });

      const result = JSON.parse(response.text || '{}');
      setFormData(prev => ({
        ...prev,
        materialName: result.materialName || prev.materialName,
        activeIngredient: result.activeIngredient || prev.activeIngredient,
        materialQuantity: result.quantity || prev.materialQuantity,
        images: [...(prev.images || []), URL.createObjectURL(file)]
      }));
    } catch (error) {
      console.error('Error scanning material:', error);
      alert('Không thể nhận diện hình ảnh. Vui lòng nhập thủ công.');
    } finally {
      setIsScanning(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData, id: Date.now().toString() };
    if (finalData.task !== 'Xử lý chất thải') {
      delete finalData.wasteType;
    }
    if (finalData.task !== 'Quản lý vật tư') {
      delete finalData.materialName;
      delete finalData.materialQuantity;
    } else {
      delete finalData.pest;
      delete finalData.method;
      delete finalData.fertilizer;
      delete finalData.dosage;
      delete finalData.quarantineTime;
    }
    onSave(finalData as FarmLog);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Thông tin cơ bản */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-semibold text-emerald-800 border-b pb-2 flex items-center gap-2">
          <Activity size={18} /> Thông tin chung
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              name="executor"
              required
              value={formData.executor}
              onChange={handleChange}
              className="pl-10 w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Nhập tên người thực hiện"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giai đoạn</label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lô canh tác</label>
            <select
              name="lot"
              value={formData.lot}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              {LOTS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock size={16} className="text-gray-400" />
            </div>
            <input
              type="datetime-local"
              name="datetime"
              required
              value={formData.datetime}
              onChange={handleChange}
              className="pl-10 w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung công việc</label>
          <select
            value={isCustomTask ? 'Khác' : formData.task}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'Khác') {
                setIsCustomTask(true);
                setRequiresMaterials(true);
                setFormData(prev => ({ ...prev, task: '' }));
              } else {
                setIsCustomTask(false);
                const predefined = PREDEFINED_TASKS.find(t => t.defaultValues.task === val);
                setRequiresMaterials(predefined ? predefined.requiresMaterials : true);
                setFormData(prev => ({ ...prev, task: val }));
              }
            }}
            className={`w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500 bg-white ${isCustomTask ? 'mb-2' : ''}`}
          >
            {TASKS.map(t => <option key={t} value={t}>{t}</option>)}
            <option value="Khác">Khác...</option>
          </select>
          
          {isCustomTask && (
            <textarea
              name="task"
              required
              value={formData.task}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Nhập nội dung công việc khác..."
            ></textarea>
          )}

          {formData.task === 'Xử lý chất thải' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại xử lý</label>
              <select
                name="wasteType"
                value={formData.wasteType}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="Thu gom chất thải độc hại">Thu gom chất thải độc hại</option>
                <option value="Xử lý phụ phẩm">Xử lý phụ phẩm</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh hoạt động / Kho vật tư</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {formData.images?.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }))}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
              <ImageIcon size={24} className="mb-1 text-gray-400" />
              <span className="text-xs font-medium">Thêm ảnh</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files) {
                    const filesArray = Array.from(e.target.files).map(file => URL.createObjectURL(file));
                    setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...filesArray] }));
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Quản lý vật tư */}
      {formData.task === 'Quản lý vật tư' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="font-semibold text-indigo-800 flex items-center gap-2">
              <Package size={18} /> Nhập kho vật tư
            </h2>
            <label className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 cursor-pointer hover:bg-indigo-100 transition-colors">
              {isScanning ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
              {isScanning ? 'Đang quét...' : 'Quét nhãn'}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                onChange={handleScanMaterial}
                disabled={isScanning}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên vật tư / Thuốc / Phân bón</label>
            <input
              type="text"
              name="materialName"
              required
              value={formData.materialName}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nhập hoặc quét ảnh để tự điền..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hoạt chất chính</label>
            <input
              type="text"
              name="activeIngredient"
              value={formData.activeIngredient}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ví dụ: Abamectin..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng / Dung tích</label>
            <input
              type="text"
              name="materialQuantity"
              required
              value={formData.materialQuantity}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ví dụ: 10 chai, 500ml..."
            />
          </div>
        </div>
      )}

      {/* Chi tiết vật tư / Thuốc */}
      {requiresMaterials && formData.task !== 'Quản lý vật tư' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-emerald-800 border-b pb-2 flex items-center gap-2">
            <Beaker size={18} /> Vật tư & Phòng trừ
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đối tượng gây hại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Bug size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="pest"
                value={formData.pest}
                onChange={handleChange}
                className="pl-10 w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ví dụ: Rêu, Sâu rầy, Rệp..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên biện pháp / Thuốc</label>
            <input
              type="text"
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ví dụ: Champion, Najat 3.6..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phân bón</label>
            <input
              type="text"
              name="fertilizer"
              value={formData.fertilizer}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ví dụ: Phân gà, NPK 30-10-10..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hoạt chất</label>
            <input
              type="text"
              name="activeIngredient"
              value={formData.activeIngredient}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ví dụ: Copper Hydroxide, Abamectin..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Liều lượng</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Droplet size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="VD: 2kg/1000L"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian cách ly</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldAlert size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="quarantineTime"
                  value={formData.quarantineTime}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="VD: 7 Ngày"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 pb-8">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm"
        >
          <Save size={20} /> Lưu Nhật Ký
        </button>
      </div>
    </form>
  );
}

function ReportScreen({ currentUser }: { currentUser: {name: string} }) {
  const [reportType, setReportType] = useState('Sâu bệnh');
  const [description, setDescription] = useState('');
  const [lot, setLot] = useState(LOTS[0]);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert('Báo cáo sự cố đã được gửi thành công!');
      setIsSubmitting(false);
      setDescription('');
      setImages([]);
    }, 1000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={20} />
          Báo cáo sự cố mới
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại sự cố</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="Sâu bệnh">Sâu bệnh bùng phát</option>
              <option value="Thời tiết">Thiệt hại do thời tiết</option>
              <option value="Thiết bị">Hỏng hóc thiết bị/hệ thống tưới</option>
              <option value="Khác">Vấn đề khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí (Lô)</label>
            <select
              value={lot}
              onChange={(e) => setLot(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              {LOTS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Mô tả rõ tình trạng sự cố..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh hiện trường</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
                <Camera size={24} className="mb-1 text-gray-400" />
                <span className="text-xs font-medium">Chụp ảnh</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  multiple 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files) {
                      const filesArray = Array.from(e.target.files).map(file => URL.createObjectURL(file));
                      setImages(prev => [...prev, ...filesArray]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-sm disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <AlertTriangle size={20} />}
            {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </button>
        </form>
      </div>
    </div>
  );
}

function SettingsScreen({ currentUser, onLogout }: { currentUser: {name: string}, onLogout: () => void }) {
  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold">
          {currentUser.name.charAt(0)}
        </div>
        <div>
          <h2 className="font-bold text-lg text-gray-800">{currentUser.name}</h2>
          <p className="text-sm text-gray-500">Nông dân hợp tác xã</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Sprout size={18} className="text-emerald-600" />
            Thông tin trang trại
          </h3>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Tên HTX:</span>
            <span className="font-medium text-gray-800">HTX Nông Nghiệp Xanh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Địa chỉ:</span>
            <span className="font-medium text-gray-800 text-right">Xã Phước Thuận, H. Xuyên Mộc</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tổng diện tích:</span>
            <span className="font-medium text-gray-800">5.2 hecta</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cây trồng chính:</span>
            <span className="font-medium text-gray-800">Sầu riêng, Bưởi</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <MapPin size={18} className="text-emerald-600" />
            Bản đồ lô canh tác
          </h3>
        </div>
        <div className="p-4">
          <div className="aspect-video bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
            <div className="grid grid-cols-2 gap-2 w-full h-full p-4 z-10">
              <div className="bg-emerald-200/80 rounded border border-emerald-400 flex items-center justify-center text-emerald-800 font-bold text-sm shadow-sm">Lô 1</div>
              <div className="bg-emerald-300/80 rounded border border-emerald-500 flex items-center justify-center text-emerald-900 font-bold text-sm shadow-sm">Lô 2</div>
              <div className="bg-emerald-100/80 rounded border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-sm shadow-sm col-span-2">Lô 3</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">Bản đồ được cấu hình bởi ban quản lý HTX</p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full bg-white text-red-600 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-50 active:bg-red-100 transition-colors shadow-sm border border-red-100"
      >
        <LogOut size={20} /> Đăng xuất tài khoản
      </button>
    </div>
  );
}
