import Icon from '../components/Icon'

const summaryCards = [
  { title: 'Tổng doanh thu', value: '128.450.000đ', delta: '+12.5%', icon: 'wallet', tone: 'blue' },
  { title: 'Tổng đơn hàng', value: '1,420', delta: '+8.2%', icon: 'clipboard', tone: 'purple' },
  { title: 'Tổng số sách', value: '8,642', delta: 'Ổn định', icon: 'book', tone: 'orange' },
  { title: 'Tổng người dùng', value: '4,289', delta: '+15.7%', icon: 'users', tone: 'green' },
]

const bestCategories = [
  { name: 'Kinh tế - Kỹ năng', meta: '420 cuốn / tuần', percent: 35, tone: 'blue' },
  { name: 'Văn học - Tiểu thuyết', meta: '312 cuốn / tuần', percent: 28, tone: 'purple' },
  { name: 'Sách thiếu nhi', meta: '258 cuốn / tuần', percent: 20, tone: 'orange' },
  { name: 'Ngoại ngữ', meta: '145 cuốn / tuần', percent: 12, tone: 'green' },
]

const latestOrders = [
  {
    id: '#ORD-8942',
    customer: 'Lê Hoàng Nam',
    avatar: 'LH',
    avatarTone: 'lavender',
    time: '10:42, 24/05/2024',
    total: '1.250.000đ',
    status: 'Đang xử lý',
    statusTone: 'pending',
  },
  {
    id: '#ORD-8941',
    customer: 'Minh Tuấn',
    avatar: 'MT',
    avatarTone: 'gray',
    time: '09:15, 24/05/2024',
    total: '450.000đ',
    status: 'Hoàn thành',
    statusTone: 'done',
  },
  {
    id: '#ORD-8940',
    customer: 'Bảo Anh',
    avatar: 'BA',
    avatarTone: 'peach',
    time: '21:30, 23/05/2024',
    total: '890.000đ',
    status: 'Chờ giao hàng',
    statusTone: 'shipping',
  },
  {
    id: '#ORD-8939',
    customer: 'Kiều Diễm',
    avatar: 'KD',
    avatarTone: 'rose',
    time: '18:45, 23/05/2024',
    total: '2.100.000đ',
    status: 'Đã hủy',
    statusTone: 'cancelled',
  },
  {
    id: '#ORD-8938',
    customer: 'Văn Thành',
    avatar: 'VT',
    avatarTone: 'blue',
    time: '15:20, 23/05/2024',
    total: '630.000đ',
    status: 'Hoàn thành',
    statusTone: 'done',
  },
]

function DashboardPage() {
  return (
    <div className="dashboard-modern">
      <section className="dashboard-modern__hero">
        <div>
          <h1>Chào buổi sáng, Quản trị viên</h1>
          <p>Dưới đây là những gì đang diễn ra tại nhà sách của bạn hôm nay.</p>
        </div>
        <button className="dashboard-modern__range" type="button">
          <Icon name="file" />
          30 ngày qua
        </button>
      </section>

      <section className="dashboard-modern__stats">
        {summaryCards.map((card) => (
          <article className="dashboard-kpi" key={card.title}>
            <div className="dashboard-kpi__top">
              <div className={`dashboard-kpi__icon dashboard-kpi__icon--${card.tone}`}>
                <Icon name={card.icon} />
              </div>
              <span className={`dashboard-kpi__delta ${card.delta === 'Ổn định' ? 'dashboard-kpi__delta--neutral' : ''}`}>
                {card.delta}
              </span>
            </div>
            <p>{card.title}</p>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-modern__content">
        <article className="dashboard-panel dashboard-panel--chart">
          <div className="dashboard-panel__header">
            <div>
              <h2>Biểu đồ doanh thu</h2>
              <p>Thống kê doanh số theo thời gian thực</p>
            </div>
            <div className="dashboard-switch">
              <button className="dashboard-switch__active" type="button">Tuần</button>
              <button type="button">Tháng</button>
            </div>
          </div>

          <div className="dashboard-bars">
            {[42, 68, 58, 92, 47, 79, 103].map((height, index) => (
              <div className="dashboard-bars__item" key={height}>
                <span
                  className={`dashboard-bars__bar ${index === 3 ? 'dashboard-bars__bar--active' : ''}`}
                  style={{ height: `${height}%` }}
                />
                <label>{['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'][index]}</label>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel dashboard-panel--compact">
          <div className="dashboard-panel__header">
            <div>
              <h2>Danh mục bán chạy</h2>
            </div>
          </div>
          <div className="dashboard-category-list">
            {bestCategories.map((item) => (
              <div className="dashboard-category" key={item.name}>
                <div className={`dashboard-category__icon dashboard-category__icon--${item.tone}`}>
                  <Icon name="spark" />
                </div>
                <div className="dashboard-category__meta">
                  <strong>{item.name}</strong>
                  <span>{item.meta}</span>
                </div>
                <b>{item.percent}%</b>
              </div>
            ))}
          </div>
          <button className="dashboard-panel__link" type="button">Xem chi tiết báo cáo</button>
        </article>
      </section>

      <section className="dashboard-panel dashboard-panel--table">
        <div className="dashboard-panel__header">
          <div>
            <h2>Đơn hàng gần đây</h2>
            <p>Danh sách 5 đơn hàng mới nhất</p>
          </div>
          <button className="dashboard-link" type="button">Xem tất cả</button>
        </div>

        <div className="table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.map((order) => (
                <tr key={order.id}>
                  <td className="dashboard-table__id">{order.id}</td>
                  <td>
                    <div className="user-cell">
                      <div className={`user-avatar user-avatar--${order.avatarTone}`}>{order.avatar}</div>
                      <div className="user-cell__content">
                        <strong>{order.customer}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{order.time}</td>
                  <td className="dashboard-table__total">{order.total}</td>
                  <td>
                    <span className={`dashboard-badge dashboard-badge--${order.statusTone}`}>{order.status}</span>
                  </td>
                  <td>
                    <button className="ghost-icon-button" type="button" aria-label={`Tùy chọn ${order.id}`}>
                      <Icon name="more" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
