import Icon from '../components/Icon'
import { inventoryGroups, reportStats, topBooks, trafficSources } from '../data/mockData'

function ReportsPage() {
  return (
    <>
      <section className="hero-panel hero-panel--compact">
        <div>
          <h1>Phân tích chuyên sâu</h1>
          <p>Dữ liệu được cập nhật mới nhất vào 08:30 hôm nay.</p>
        </div>
        <div className="hero-panel__actions report-actions">
          <button className="ghost-select" type="button">7 Ngày qua</button>
          <button className="ghost-select" type="button">Tháng này</button>
          <button className="ghost-select" type="button">Quý này</button>
          <button className="ghost-select" type="button">01/10/2023 - 31/10/2023</button>
          <button className="primary-button" type="button">
            <Icon name="export" />
            Xuất báo cáo
          </button>
        </div>
      </section>

      <section className="stats-grid stats-grid--reports">
        {reportStats.map((item) => (
          <article className="stat-card stat-card--report" key={item.title}>
            <div className="stat-card__top">
              <div className={`stat-card__icon stat-card__icon--${item.deltaType}`}>
                <Icon name={item.icon} />
              </div>
              <span
                className={`pill ${
                  item.deltaType === 'negative'
                    ? 'pill--negative'
                    : item.deltaType === 'positiveAlt'
                      ? 'pill--neutral'
                      : item.deltaType === 'neutral'
                        ? 'pill--soft'
                        : 'pill--positive'
                }`}
              >
                {item.delta}
              </span>
            </div>
            <p className="stat-card__label stat-card__label--normal">{item.title}</p>
            <strong className="stat-card__value">{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="content-grid reports-grid">
        <article className="card report-chart-card">
          <div className="card__header">
            <div>
              <h2>Tăng trưởng doanh thu</h2>
              <p>Phân tích theo tuần qua</p>
            </div>
            <div className="legend-group">
              <span className="legend-dot legend-dot--solid">Thực tế</span>
              <span className="legend-dot legend-dot--soft">Dự báo</span>
            </div>
          </div>
          <div className="bar-chart">
            {[
              ['Thứ 2', 38, 52],
              ['Thứ 3', 54, 68],
              ['Thứ 4', 76, 90],
              ['Thứ 5', 92, 108],
              ['Thứ 6', 84, 96],
              ['Thứ 7', 100, 116],
              ['Chủ Nhật', 88, 102],
            ].map(([label, actual, forecast]) => (
              <div className="bar-chart__item" key={label}>
                <div className="bar-chart__columns">
                  <span className="bar-chart__bar bar-chart__bar--forecast" style={{ height: `${forecast}%` }} />
                  <span className="bar-chart__bar bar-chart__bar--actual" style={{ height: `${actual}%` }} />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="card__header">
            <div>
              <h2>Nguồn khách hàng</h2>
            </div>
          </div>
          <div className="category-list">
            {trafficSources.map((item) => (
              <div className="category-row" key={item.label}>
                <div className="category-row__meta">
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div className="progress">
                  <span className={`progress__fill progress__fill--${item.tone}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="insight-box">
            <div className="insight-box__icon">
              <Icon name="note" />
            </div>
            <p>
              <strong>Insight AI</strong>
              <br />
              Lưu lượng khách từ mạng xã hội tăng mạnh vào cuối tuần. Hãy chuẩn bị tồn kho sách bán chạy.
            </p>
          </div>
        </article>
      </section>

      <section className="card report-stock-card">
        <div className="card__header">
          <div>
            <h2>Trạng thái tồn kho theo danh mục</h2>
            <p>Phân bổ nguồn lực và kiểm soát rủi ro</p>
          </div>
          <a href="/">Xem chi tiết kho</a>
        </div>
        <div className="inventory-panels">
          {inventoryGroups.map((item) => (
            <article className="inventory-panel" key={item.title}>
              <div className={`mini-icon mini-icon--${item.tone === 'peach' ? 'danger' : 'soft'}`}>
                <Icon name="book" />
              </div>
              <strong>{item.title}</strong>
              <span className="inventory-panel__amount">{item.amount}</span>
              <span className="inventory-panel__note">{item.note}</span>
              <span className={`inventory-panel__status inventory-panel__status--${item.tone}`}>{item.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="card report-top-card">
        <div className="card__header">
          <div>
            <h2>Sản phẩm bán chạy nhất</h2>
            <p>Xếp hạng dựa trên doanh thu 7 ngày qua</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Đã bán</th>
                <th>Doanh thu</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {topBooks.map((book) => (
                <tr key={book.title}>
                  <td>
                    <div className="book-cell">
                      <div className={`book-thumb book-thumb--${book.coverTone}`} />
                      <div className="book-cell__content">
                        <strong>{book.title}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{book.category}</td>
                  <td>{book.sold}</td>
                  <td className="price-cell">{book.revenue}</td>
                  <td>
                    <span className={`tag tag--${book.tone}`}>{book.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="page-footer">© 2023 The Curated Lexicon. Powered by Advanced Analytics Engine.</footer>
      </section>
    </>
  )
}

export default ReportsPage
