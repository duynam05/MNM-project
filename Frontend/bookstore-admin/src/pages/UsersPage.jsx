import Icon from '../components/Icon'
import { userStats, users } from '../data/mockData'

function UsersPage({ onCreateUser }) {
  return (
    <>
      <section className="hero-panel hero-panel--compact">
        <div>
          <h1>Người dùng</h1>
          <p>Quản lý và phân quyền nhân sự trong hệ thống Lexicon.</p>
        </div>
        <div className="hero-panel__actions">
          <button className="primary-button" type="button" onClick={onCreateUser}>
            <Icon name="plus" />
            Thêm Người Dùng Mới
          </button>
        </div>
      </section>

      <section className="stats-grid stats-grid--users">
        {userStats.map((item) => (
          <article className="stat-card stat-card--user" key={item.title}>
            <div className="stat-card__top">
              <p className="stat-card__label">{item.title}</p>
              {item.icon ? (
                <div className={`mini-icon mini-icon--${item.emphasis === 'danger' ? 'danger' : 'soft'}`}>
                  <Icon name={item.icon} />
                </div>
              ) : null}
            </div>
            <div className="stat-card__inline">
              <strong className={`stat-card__value ${item.emphasis ? `stat-card__value--${item.emphasis}` : ''}`}>{item.value}</strong>
              {item.delta ? <span className="pill pill--positive">{item.delta}</span> : null}
              {item.suffix ? <span className="dash-mark">{item.suffix}</span> : null}
            </div>
          </article>
        ))}
      </section>

      <section className="card users-card">
        <div className="users-toolbar">
          <div className="users-toolbar__actions">
            <button className="toolbar-button" type="button">
              <Icon name="filter" />
              Lọc
            </button>
            <button className="toolbar-button" type="button">
              <Icon name="sort" />
              Sắp xếp
            </button>
          </div>
          <p>Hiển thị 10 trong 1,284 người dùng</p>
        </div>

        <div className="table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className="user-cell">
                      <div className={`user-avatar user-avatar--${user.avatarTone}`}>{user.avatar}</div>
                      <div className="user-cell__content">
                        <strong>{user.name}</strong>
                        <span>{user.detail}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`tag tag--${user.roleTone}`}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`user-status user-status--${user.statusTone}`}>{user.status}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="ghost-icon-button" type="button" aria-label={`Sửa ${user.name}`}>
                        <Icon name="edit" />
                      </button>
                      <button className="ghost-icon-button" type="button" aria-label={`Xóa ${user.name}`}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="inventory-footer users-footer">
          <button className="page-link" type="button">
            <Icon name="chevronLeft" />
            Trước
          </button>
          <div className="pagination">
            <button className="pagination__page pagination__page--active" type="button">1</button>
            <button className="pagination__page" type="button">2</button>
            <button className="pagination__page" type="button">3</button>
            <span className="pagination__ellipsis">...</span>
            <button className="pagination__page" type="button">129</button>
          </div>
          <button className="page-link" type="button">
            Sau
            <Icon name="chevronRight" />
          </button>
        </div>
      </section>
    </>
  )
}

export default UsersPage
