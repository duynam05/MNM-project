export const navigationItems = [
  { id: 'dashboard', label: 'Bảng điều khiển', icon: 'grid' },
  { id: 'books', label: 'Quản lý sách', icon: 'book' },
  { id: 'users', label: 'Quản lý người dùng', icon: 'users' },
  { id: 'orders', label: 'Đơn hàng', icon: 'cart' },
  { id: 'reports', label: 'Báo cáo', icon: 'chart' },
  { id: 'settings', label: 'Cài đặt', icon: 'settings' },
]

export const dashboardStats = [
  { title: 'Tổng số sách', value: '12,482', delta: '+12%', deltaType: 'positive', icon: 'book' },
  { title: 'Người dùng', value: '3,890', delta: '+5.4%', deltaType: 'positive', icon: 'users' },
  { title: 'Đơn hàng', value: '842', delta: '-2.1%', deltaType: 'negative', icon: 'clipboard' },
  { title: 'Doanh thu', value: '450,200,000đ', delta: '+24%', deltaType: 'positive', icon: 'wallet' },
]

export const categories = [
  { label: 'Văn học & Nghệ thuật', value: 42 },
  { label: 'Kinh tế & Khởi nghiệp', value: 28 },
  { label: 'Thiếu nhi & Giáo dục', value: 15 },
  { label: 'Sách Ngoại văn', value: 10 },
  { label: 'Khác', value: 5 },
]

export const recentOrders = [
  { id: '#ORD-9021', customer: 'Nguyễn Văn A', status: 'Hoàn thành', statusType: 'success', total: '450,000đ' },
  { id: '#ORD-8992', customer: 'Trần Thị B', status: 'Đang xử lý', statusType: 'warning', total: '1,280,000đ' },
  { id: '#ORD-8945', customer: 'Lê Văn C', status: 'Hoàn thành', statusType: 'success', total: '215,000đ' },
]

export const featuredBooks = [
  { title: 'Muôn Kiếp Nhân Sinh - Phần 3', author: 'Nguyên Phong', price: '168,000đ', note: 'Đang bán tốt' },
  { title: 'Nhà Giả Kim (Tái bản 2024)', author: 'Paulo Coelho', price: '89,000đ', note: 'Kho: 42 cuốn' },
]

export const bookStats = [
  { title: 'Tổng số sách', value: '1,284', delta: '+12%' },
  { title: 'Đang mượn', value: '432' },
  { title: 'Sách sắp hết', value: '18', emphasis: 'danger' },
  { title: 'Doanh thu tháng', value: '42.5M', suffix: 'VND' },
]

export const inventoryBooks = [
  {
    id: 'BK-1024',
    title: 'Kỷ Nguyên Số',
    isbn: 'ISBN: 978-604-321',
    author: 'Trần Mạnh Hùng',
    category: 'Công nghệ',
    categoryTone: 'slate',
    price: '185,000đ',
    stock: 124,
    stockWidth: 78,
    coverTone: 'blue',
  },
  {
    id: 'BK-1055',
    title: 'Tư Duy Tối Giản',
    isbn: 'ISBN: 978-604-772',
    author: 'Lê Thu Hà',
    category: 'Kỹ năng sống',
    categoryTone: 'pink',
    price: '120,000đ',
    stock: 8,
    stockWidth: 15,
    stockTone: 'danger',
    coverTone: 'rose',
  },
  {
    id: 'BK-0982',
    title: 'Lịch Sử Văn Minh',
    isbn: 'ISBN: 978-604-551',
    author: 'Nguyễn Hoàng Nam',
    category: 'Lịch sử',
    categoryTone: 'indigo',
    price: '245,000đ',
    stock: 42,
    stockWidth: 40,
    coverTone: 'teal',
  },
  {
    id: 'BK-1102',
    title: 'Nghệ Thuật Đương Đại',
    isbn: 'ISBN: 978-604-900',
    author: 'Phạm Đăng Khoa',
    category: 'Nghệ thuật',
    categoryTone: 'sky',
    price: '310,000đ',
    stock: 56,
    stockWidth: 54,
    coverTone: 'ink',
  },
]

export const userStats = [
  { title: 'Tổng nhân sự', value: '1,284', delta: '+12%' },
  { title: 'Đang hoạt động', value: '1,202', suffix: ' ' },
  { title: 'Quản trị viên', value: '14', icon: 'shield' },
  { title: 'Bị hạn chế', value: '8', emphasis: 'danger', icon: 'ban' },
]

export const users = [
  {
    id: '#US-9012',
    name: 'Nguyễn Linh',
    detail: 'Tham gia 12/2023',
    email: 'linh.nguyen@lexicon.vn',
    role: 'Quản lý kho',
    roleTone: 'lavender',
    status: 'Hoạt động',
    statusTone: 'active',
    avatar: 'NL',
    avatarTone: 'blue',
  },
  {
    id: '#US-8944',
    name: 'Phạm Thu Hà',
    detail: 'Tham gia 10/2023',
    email: 'ha.pham@lexicon.vn',
    role: 'Biên tập viên',
    roleTone: 'soft',
    status: 'Hoạt động',
    statusTone: 'active',
    avatar: 'PH',
    avatarTone: 'rose',
  },
  {
    id: '#US-8721',
    name: 'Trần Hùng',
    detail: 'Tham gia 05/2022',
    email: 'hung.tran@lexicon.vn',
    role: 'Nhân viên bán hàng',
    roleTone: 'indigo',
    status: 'Bị khóa',
    statusTone: 'blocked',
    avatar: 'TH',
    avatarTone: 'gray',
  },
  {
    id: '#US-8550',
    name: 'Lê Minh Tâm',
    detail: 'Tham gia 01/2023',
    email: 'tam.le@lexicon.vn',
    role: 'Quản trị viên',
    roleTone: 'slate',
    status: 'Hoạt động',
    statusTone: 'active',
    avatar: 'LT',
    avatarTone: 'dark',
  },
]

export const orderStats = [
  { title: 'Đang chờ', value: '42', delta: '+12%', icon: 'clipboard', deltaType: 'positive' },
  { title: 'Đang giao', value: '128', delta: '+5%', icon: 'cart', deltaType: 'positiveAlt' },
  { title: 'Hoàn tất', value: '1,024', delta: '+24%', icon: 'checkCircle', deltaType: 'positive' },
  { title: 'Đã hủy', value: '18', delta: '-2%', icon: 'ban', deltaType: 'negative' },
]

export const orderRows = [
  {
    id: '#ORD-8821',
    customer: 'Nguyễn Văn Tú',
    email: 'tu.nguyen@gmail.com',
    createdAt: '20/10/2023, 14:30',
    total: '450,000đ',
    status: 'Pending',
    statusTone: 'pending',
    avatar: 'NT',
    avatarTone: 'gray',
  },
  {
    id: '#ORD-8790',
    customer: 'Phạm Thị Lan',
    email: 'lan.pmai@gmail.com',
    createdAt: '19/10/2023, 09:15',
    total: '1,250,000đ',
    status: 'Shipped',
    statusTone: 'shipped',
    avatar: 'PL',
    avatarTone: 'rose',
  },
  {
    id: '#ORD-8755',
    customer: 'Lê Hoàng',
    email: 'lehoang.ds@outlook.com',
    createdAt: '18/10/2023, 16:45',
    total: '320,000đ',
    status: 'Delivered',
    statusTone: 'delivered',
    avatar: 'LH',
    avatarTone: 'lavender',
  },
  {
    id: '#ORD-8742',
    customer: 'Trần Hùng',
    email: 'hungtran@gmail.com',
    createdAt: '18/10/2023, 11:20',
    total: '150,000đ',
    status: 'Cancelled',
    statusTone: 'cancelled',
    avatar: 'TH',
    avatarTone: 'peach',
  },
]

export const quickOrderItems = [
  {
    id: 'OD-1',
    title: 'Suối Nguồn (The Fountainhead)',
    subtitle: 'Ayn Rand • Bìa Cứng',
    unitPrice: '245,000đ',
    quantity: 2,
    total: '490,000đ',
    coverTone: 'forest',
  },
  {
    id: 'OD-2',
    title: 'Lược Sử Loài Người',
    subtitle: 'Yuval Noah Harari • Alpha Books',
    unitPrice: '189,000đ',
    quantity: 1,
    total: '189,000đ',
    coverTone: 'night',
  },
]

export const reportStats = [
  { title: 'Tổng doanh thu', value: '1,284,500,000đ', delta: '+12.5%', icon: 'wallet', deltaType: 'positive' },
  { title: 'Khách hàng mới', value: '842', delta: '+5.2%', icon: 'users', deltaType: 'positiveAlt' },
  { title: 'Đơn hàng trung bình', value: '350,000đ', delta: '-2.1%', icon: 'clipboard', deltaType: 'negative' },
  { title: 'Tỷ lệ tồn kho', value: '15.4%', delta: 'Ổn định', icon: 'book', deltaType: 'neutral' },
]

export const trafficSources = [
  { label: 'Mạng xã hội', value: 45, tone: 'blue' },
  { label: 'Trực tiếp', value: 30, tone: 'pink' },
  { label: 'Quảng cáo', value: 15, tone: 'gray' },
  { label: 'Khác', value: 10, tone: 'dark' },
]

export const inventoryGroups = [
  { title: 'Văn học', amount: '2,450', note: 'Đầu sách', status: 'Còn dồi dào', tone: 'blue' },
  { title: 'Khoa học', amount: '840', note: 'Đầu sách', status: 'Sắp hết', tone: 'pink' },
  { title: 'Kỹ năng sống', amount: '1,120', note: 'Đầu sách', status: 'Bình thường', tone: 'slate' },
  { title: 'Kinh tế', amount: '420', note: 'Đầu sách', status: 'Hết hàng', tone: 'peach' },
]

export const topBooks = [
  { title: 'Nhà Giả Kim', category: 'Văn học ngoại văn', sold: 324, revenue: '25,920,000đ', status: 'Còn hàng', coverTone: 'night', tone: 'delivered' },
  { title: 'Dám Bị Ghét', category: 'Kỹ năng sống', sold: 215, revenue: '18,275,000đ', status: 'Còn hàng', coverTone: 'sun', tone: 'delivered' },
  { title: 'Súng, Vi Trùng Và Thép', category: 'Khoa học - Lịch sử', sold: 189, revenue: '41,580,000đ', status: 'Sắp hết', coverTone: 'forest', tone: 'cancelled' },
]

export const notificationItems = [
  { title: 'Đơn hàng mới', text: 'Nhận thông báo khi có khách hàng đặt sách mới qua web.', enabled: true },
  { title: 'Kho hàng sắp hết', text: 'Cảnh báo khi số lượng sách còn dưới 5 cuốn.', enabled: true },
  { title: 'Báo cáo tuần', text: 'Gửi báo cáo tổng kết doanh thu vào mỗi sáng thứ Hai.', enabled: false },
  { title: 'Đăng nhập mới', text: 'Báo cáo khi tài khoản được đăng nhập từ thiết bị lạ.', enabled: true },
]
