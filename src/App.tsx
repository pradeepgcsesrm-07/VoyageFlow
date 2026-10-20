import { useEffect, useMemo, useState } from 'react';
import './App.css';

type Role = 'Employee' | 'Admin' | 'Manager' | 'Finance';
type Page = 'Dashboard' | 'Travel Requests' | 'Reimbursements' | 'Analytics';

type TravelRequest = {
  id: number;
  employee: string;
  destination: string;
  purpose: string;
  departure: string;
  returnDate: string;
  budget: number;
  status: string;
};

type Claim = {
  id: number;
  employee: string;
  category: string;
  amount: number;
  description: string;
  status: string;
  billImage?: string;
  billName?: string;
  billDate?: string;
};

const DEMO_ACCOUNTS: Record<
  string,
  { password: string; role: Role; name: string }
> = {
  'employee@voyageflow.demo': {
    password: 'Emp@123',
    role: 'Employee',
    name: 'Arun Kumar',
  },
  'admin@voyageflow.demo': {
    password: 'Admin@123',
    role: 'Admin',
    name: 'Admin User',
  },
  'manager@voyageflow.demo': {
    password: 'Manager@123',
    role: 'Manager',
    name: 'Manager User',
  },
  'finance@voyageflow.demo': {
    password: 'Finance@123',
    role: 'Finance',
    name: 'Finance User',
  },
};

const initialRequests: TravelRequest[] = [
  {
    id: 1001,
    employee: 'Arun Kumar',
    destination: 'Bengaluru',
    purpose: 'Client meeting',
    departure: '2026-11-02',
    returnDate: '2026-11-04',
    budget: 12000,
    status: 'PENDING ADMIN APPROVAL',
  },
  {
    id: 1002,
    employee: 'Priya Sharma',
    destination: 'Mumbai',
    purpose: 'Business conference',
    departure: '2026-11-10',
    returnDate: '2026-11-13',
    budget: 18500,
    status: 'WAITING FOR MANAGER APPROVAL',
  },
  {
    id: 1003,
    employee: 'Rahul Das',
    destination: 'Hyderabad',
    purpose: 'Project discussion',
    departure: '2026-11-18',
    returnDate: '2026-11-20',
    budget: 9500,
    status: 'APPROVED',
  },
];

const initialClaims: Claim[] = [
  {
    id: 2001,
    employee: 'Arun Kumar',
    category: 'Transport',
    amount: 1500,
    description: 'Airport taxi',
    status: 'PENDING FINANCE REVIEW',
  },
  {
    id: 2002,
    employee: 'Priya Sharma',
    category: 'Accommodation',
    amount: 4200,
    description: 'Business hotel',
    status: 'APPROVED FOR PAYMENT',
  },
  {
    id: 2003,
    employee: 'Rahul Das',
    category: 'Meals',
    amount: 850,
    description: 'Client meeting lunch',
    status: 'PAID',
  },
];

const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

function readSaved<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [role, setRole] = useState<Role>('Employee');
  const [name, setName] = useState('Arun Kumar');
  const [page, setPage] = useState<Page>('Dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loginEmail, setLoginEmail] = useState('employee@voyageflow.demo');
  const [loginPassword, setLoginPassword] = useState('Emp@123');
  const [loginError, setLoginError] = useState('');

  const [requests, setRequests] = useState<TravelRequest[]>(() =>
    readSaved('vf_requests', initialRequests)
  );

  const [claims, setClaims] = useState<Claim[]>(() =>
    readSaved('vf_claims', initialClaims)
  );

  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');

  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [departure, setDeparture] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [budget, setBudget] = useState('10000');

  const [category, setCategory] = useState('Transport');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [billImage, setBillImage] = useState('');
  const [billName, setBillName] = useState('');
  const [billDate, setBillDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    try {
      localStorage.setItem('vf_requests', JSON.stringify(requests));
    } catch {
      setNotice('Storage is full. Some changes may not be saved.');
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem('vf_claims', JSON.stringify(claims));
    } catch {
      setNotice('Storage is full. Try a smaller bill image.');
    }
  }, [claims]);

  const filteredRequests = useMemo(() => {
    const query = search.toLowerCase();

    return requests.filter((request) => {
      const matches =
        request.destination.toLowerCase().includes(query) ||
        request.employee.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query) ||
        String(request.id).includes(query);

      return matches && (role !== 'Employee' || request.employee === name);
    });
  }, [requests, search, role, name]);

  const filteredClaims = useMemo(() => {
    const query = search.toLowerCase();

    return claims.filter((claim) => {
      const matches =
        claim.employee.toLowerCase().includes(query) ||
        claim.category.toLowerCase().includes(query) ||
        claim.description.toLowerCase().includes(query) ||
        claim.status.toLowerCase().includes(query);

      return matches && (role !== 'Employee' || claim.employee === name);
    });
  }, [claims, search, role, name]);

  const myRequests = requests.filter((r) => r.employee === name);
  const myClaims = claims.filter((c) => c.employee === name);

  const pendingAdmin = requests.filter(
    (r) => r.status === 'PENDING ADMIN APPROVAL'
  ).length;

  const pendingManager = requests.filter(
    (r) => r.status === 'WAITING FOR MANAGER APPROVAL'
  ).length;

  const approvedTrips = requests.filter((r) => r.status === 'APPROVED').length;

  const totalExpenses = claims.reduce((sum, c) => sum + c.amount, 0);

  const pendingClaims = claims.filter(
    (c) => c.status === 'PENDING FINANCE REVIEW'
  ).length;

  const paidExpenses = claims
    .filter((c) => c.status === 'PAID')
    .reduce((sum, c) => sum + c.amount, 0);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const account = DEMO_ACCOUNTS[loginEmail.trim().toLowerCase()];

    if (!account || account.password !== loginPassword) {
      setLoginError('Invalid email or password. Please try again.');
      return;
    }

    setRole(account.role);
    setName(account.name);
    setPage('Dashboard');
    setSearch('');
    setNotice('');
    setLoginError('');
    setIsLoggedIn(true);
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setLoginPassword('');
    setLoginError('');
    setSearch('');
    setNotice('');
    setPage('Dashboard');
  }

  function submitTravel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (returnDate < departure) {
      setNotice('Return date cannot be before departure date.');
      return;
    }

    const newRequest: TravelRequest = {
      id: Date.now(),
      employee: name,
      destination,
      purpose,
      departure,
      returnDate,
      budget: Number(budget),
      status: 'PENDING ADMIN APPROVAL',
    };

    setRequests((previous) => [newRequest, ...previous]);
    setDestination('');
    setPurpose('');
    setDeparture('');
    setReturnDate('');
    setBudget('10000');
    setNotice('Travel request submitted to Admin for approval.');
    setPage('Travel Requests');
  }

  function submitClaim(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(claimAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice('Please enter a valid reimbursement amount.');
      return;
    }

    if (!billImage) {
      setNotice('Please upload a bill image before submitting.');
      return;
    }

    const newClaim: Claim = {
      id: Date.now(),
      employee: name,
      category,
      amount,
      description: claimDescription.trim(),
      status: 'PENDING FINANCE REVIEW',
      billImage,
      billName,
      billDate,
    };

    setClaims((previous) => [newClaim, ...previous]);
    setClaimAmount('');
    setClaimDescription('');
    setBillImage('');
    setBillName('');
    setBillDate(new Date().toISOString().slice(0, 10));
    setNotice('Reimbursement and bill submitted successfully!');
    setPage('Reimbursements');
  }

  function updateRequest(id: number, status: string) {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );

    setNotice(`Travel request updated: ${status}`);
  }

  function updateClaim(id: number, status: string) {
    setClaims((previous) =>
      previous.map((claim) => (claim.id === id ? { ...claim, status } : claim))
    );

    setNotice(`Reimbursement updated: ${status}`);
  }

  function viewBill(claim: Claim) {
    if (!claim.billImage) {
      setNotice('No bill image was attached to this claim.');
      return;
    }

    const imageWindow = window.open('', '_blank');

    if (!imageWindow) {
      setNotice('Please allow pop-ups to view the bill.');
      return;
    }

    const image = imageWindow.document.createElement('img');
    image.src = claim.billImage;
    image.alt = claim.billName || 'Expense receipt';
    image.style.cssText =
      'display:block;max-width:95%;max-height:90vh;margin:24px auto;object-fit:contain';

    imageWindow.document.title = claim.billName || 'Expense receipt';
    imageWindow.document.body.style.cssText =
      'margin:0;background:#f3f6fa;font-family:Arial,sans-serif';

    imageWindow.document.body.appendChild(image);
  }

  function statusClass(status: string) {
    if (
      status === 'APPROVED' ||
      status === 'PAID' ||
      status === 'APPROVED FOR PAYMENT'
    ) {
      return 'status status-approved';
    }

    if (status.startsWith('REJECTED')) {
      return 'status status-rejected';
    }

    return 'status status-pending';
  }

  function Status({ value }: { value: string }) {
    return <span className={statusClass(value)}>{value}</span>;
  }

  // =========================================================
  // UPDATED SIGN-IN PAGE
  // =========================================================

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        {/* LEFT SIDE: TRAVEL BRANDING */}

        {/* LEFT SIDE: UPDATED TRAVEL BRANDING */}
        <section className="login-decoration">
          <div className="travel-topbar">
            <div className="travel-logo">V</div>
            <span>VoyageFlow</span>
            <span className="brand-tag">BUSINESS TRAVEL</span>
          </div>
          
<div className="flight-animation" aria-hidden="true">
  <div className="flight-particles">
    <span />
    <span />
    <span />
    <span />
    <span />
    <span />
    <span />
    <span />
  </div>

  <svg
    className="flight-route"
    viewBox="0 0 500 220"
    fill="none"
    preserveAspectRatio="none"
  >
    <path
      d="M 25 175 C 125 20, 260 210, 360 80 S 440 35, 475 55"
      stroke="rgba(125, 211, 252, 0.65)"
      strokeWidth="2"
      strokeDasharray="5 9"
      strokeLinecap="round"
    />
    <circle cx="25" cy="175" r="5" fill="#7dd3fc" />
    <circle cx="475" cy="55" r="5" fill="#7dd3fc" />
  </svg>

  <span className="flight-plane">✈</span>
</div>


          <div className="travel-content">
            <span className="travel-eyebrow">
              YOUR BUSINESS JOURNEY STARTS HERE
            </span>

            <h1>
              Business travel,
              <br />
              <span>without the</span>
              <br />
              complications.
            </h1>

            <p className="travel-description">
              Plan trips, simplify approvals, and manage expenses — all from one
              seamless workspace.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <div>
                  <strong>Smarter trip approvals</strong>
                  <p>Keep every request organised.</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon">₹</span>
                <div>
                  <strong>Effortless expense tracking</strong>
                  <p>Keep bills and reimbursements together.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="travel-footer">
            <span>TRAVEL SMARTER. WORK BETTER.</span>
            <span>VOYAGEFLOW © 2026</span>
          </div>
        </section>
        {/* RIGHT SIDE: SIGN-IN FORM */}
        <section className="login-form-side">
          <div className="login-form-container">
            <div className="mobile-brand">
              <div className="travel-logo">V</div>
              <span>VoyageFlow</span>
            </div>

            <div className="login-heading">
              <span className="login-welcome">WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>Enter your details to access your workspace.</p>
            </div>

            <form className="voyage-login-form" onSubmit={handleLogin}>
              <label htmlFor="login-email">Email address</label>

              <input
                id="login-email"
                type="email"
                placeholder="you@company.com"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                autoComplete="username"
                required
              />

              <label htmlFor="login-password">Password</label>

              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                autoComplete="current-password"
                required
              />

              {loginError && (
                <p className="login-error" role="alert">
                  {loginError}
                </p>
              )}

              <button className="voyage-signin-button" type="submit">
                Sign in to VoyageFlow
                <span>→</span>
              </button>
            </form>

            <div className="login-security-note">
              <span>◈</span>
              Your workspace, all in one place.
            </div>

            <div className="demo-login-box">
              <h3>DEMO ACCESS</h3>
              <p>Click a role to fill in its demo credentials.</p>

             
<div 
className="demo-login-roles">
  {(
    [
      ['Employee', 'employee@voyageflow.demo', 'Emp@123'],
      ['Admin', 'admin@voyageflow.demo', 'Admin@123'],
      ['Manager', 'manager@voyageflow.demo', 'Manager@123'],
      ['Finance', 'finance@voyageflow.demo', 'Finance@123'],
    ] as const
  ).map(([demoRole, email, password]) => (
    <button
      type="button"
      className="demo-role-button"
      key={demoRole}
      onClick={() => {
        setLoginEmail(email);
        setLoginPassword(password);
        setLoginError('');
      }}
    >
      <span>{demoRole}</span>
    </button>
  ))}
</div>


            <p className="login-bottom-text">
              © 2026 VoyageFlow · Business travel made simpler
            </p>
          </div>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================
  // MAIN APP: DASHBOARD, TRAVEL, REIMBURSEMENTS AND ANALYTICS
  // =========================================================

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">V</div>
          <div>
            <h2>VoyageFlow</h2>
            <span>EXPENSE MANAGEMENT</span>
          </div>
        </div>

        <div className="profile-card">
          <div className="avatar">{name.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{name}</strong>
            <span>{role}</span>
          </div>
        </div>

        <p className="nav-heading">WORKSPACE</p>

        {(
          [
            ['Dashboard', '▦'],
            ['Travel Requests', '✈'],
            ['Reimbursements', '₹'],
            ['Analytics', '▥'],
          ] as [Page, string][]
        ).map(([item, symbol]) => (
          <button
            key={item}
            className={`nav-link ${page === item ? 'active' : ''}`}
            onClick={() => {
              setPage(item);
              setSearch('');
              setNotice('');
            }}
          >
            <span>{symbol}</span>
            {item}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="help-card">
            <strong>Need help?</strong>
            <p>
              Submit receipts and track your business expenses in one place.
            </p>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            ↪ &nbsp; Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>{page}</h1>
          </div>

          <div className="topbar-user">
            <div className="topbar-date">
              {new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div className="avatar small">{name.charAt(0)}</div>
          </div>
        </header>

        {notice && (
          <div className="notice">
            <span>{notice}</span>
            <button onClick={() => setNotice('')}>×</button>
          </div>
        )}

        {page === 'Dashboard' && (
          <>
            <section className="welcome-banner">
              <div>
                <p className="eyebrow">VOYAGEFLOW OVERVIEW</p>
                <h2>Hello, {name.split(' ')[0]} 👋</h2>
                <p>
                  {role === 'Employee'
                    ? 'Submit expense bills and keep track of your reimbursements.'
                    : role === 'Finance'
                    ? 'Verify employee receipts and manage reimbursement payments.'
                    : role === 'Admin'
                    ? 'Review employee travel requests and approvals.'
                    : 'Review travel requests forwarded for final approval.'}
                </p>
              </div>
              <div className="banner-icon">₹</div>
            </section>

            <div className="section-heading">
              <div>
                <h2>At a glance</h2>
                <p>Your travel and reimbursement summary</p>
              </div>
            </div>

            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon teal">₹</span>
                <p>Total claims submitted</p>
                <h2>{role === 'Employee' ? myClaims.length : claims.length}</h2>
                <span className="stat-note">Expense reimbursement claims</span>
              </div>

              <div className="stat-card">
                <span className="stat-icon orange">◷</span>
                <p>Awaiting finance review</p>
                <h2>{pendingClaims}</h2>
                <span className="stat-note">Claims to verify</span>
              </div>

              <div className="stat-card">
                <span className="stat-icon purple">✓</span>
                <p>Approved trips</p>
                <h2>
                  {role === 'Employee'
                    ? myRequests.filter((r) => r.status === 'APPROVED').length
                    : approvedTrips}
                </h2>
                <span className="stat-note">Travel requests approved</span>
              </div>

              <div className="stat-card">
                <span className="stat-icon blue">₹</span>
                <p>Total paid reimbursements</p>
                <h2>{money(paidExpenses)}</h2>
                <span className="stat-note">Claims marked as paid</span>
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Recent reimbursement claims</h2>
                  <p>Latest claims and their progress</p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => setPage('Reimbursements')}
                >
                  View reimbursements →
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Receipt</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {claims
                      .filter((c) => role !== 'Employee' || c.employee === name)
                      .slice(0, 5)
                      .map((claim) => (
                        <tr key={claim.id}>
                          <td>{claim.employee}</td>
                          <td>{claim.category}</td>
                          <td>{money(claim.amount)}</td>
                          <td>
                            {claim.billImage ? (
                              <button
                                className="secondary-button"
                                onClick={() => viewBill(claim)}
                              >
                                View bill
                              </button>
                            ) : (
                              <span className="muted">Not attached</span>
                            )}
                          </td>
                          <td>
                            <Status value={claim.status} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {page === 'Travel Requests' && (
          <>
            {role === 'Employee' && (
              <section className="content-card">
                <div className="section-heading">
                  <div>
                    <h2>Submit a travel request</h2>
                    <p>Provide your trip details for approval.</p>
                  </div>
                </div>

                <form className="app-form" onSubmit={submitTravel}>
                  <label>
                    Destination
                    <input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      required
                    />
                  </label>

                  <label>
                    Purpose of travel
                    <input
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="e.g. Client meeting"
                      required
                    />
                  </label>

                  <label>
                    Departure date
                    <input
                      type="date"
                      value={departure}
                      onChange={(e) => setDeparture(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Return date
                    <input
                      type="date"
                      value={returnDate}
                      min={departure || undefined}
                      onChange={(e) => setReturnDate(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Estimated budget (₹)
                    <input
                      type="number"
                      min="1"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                    />
                  </label>

                  <button className="primary-button" type="submit">
                    Submit for approval →
                  </button>
                </form>
              </section>
            )}

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>
                    {role === 'Employee'
                      ? 'My travel requests'
                      : 'Travel requests'}
                  </h2>
                  <p>Track requests and their approval status.</p>
                </div>

                <input
                  className="search-input"
                  placeholder="Search requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Employee</th>
                      <th>Destination</th>
                      <th>Travel dates</th>
                      <th>Budget</th>
                      <th>Status</th>
                      {(role === 'Admin' || role === 'Manager') && (
                        <th>Actions</th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td>VF-{request.id}</td>
                        <td>{request.employee}</td>
                        <td>
                          <strong>{request.destination}</strong>
                          <span className="table-subtitle">
                            {request.purpose}
                          </span>
                        </td>
                        <td>
                          {request.departure} – {request.returnDate}
                        </td>
                        <td>{money(request.budget)}</td>
                        <td>
                          <Status value={request.status} />
                        </td>

                        {(role === 'Admin' || role === 'Manager') && (
                          <td>
                            <div className="action-buttons">
                              {role === 'Admin' &&
                                request.status === 'PENDING ADMIN APPROVAL' && (
                                  <>
                                    <button
                                      className="approve-button"
                                      onClick={() =>
                                        updateRequest(
                                          request.id,
                                          'WAITING FOR MANAGER APPROVAL'
                                        )
                                      }
                                    >
                                      Forward
                                    </button>
                                    <button
                                      className="reject-button"
                                      onClick={() =>
                                        updateRequest(
                                          request.id,
                                          'REJECTED BY ADMIN'
                                        )
                                      }
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}

                              {role === 'Manager' &&
                                request.status ===
                                  'WAITING FOR MANAGER APPROVAL' && (
                                  <>
                                    <button
                                      className="approve-button"
                                      onClick={() =>
                                        updateRequest(request.id, 'APPROVED')
                                      }
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="reject-button"
                                      onClick={() =>
                                        updateRequest(
                                          request.id,
                                          'REJECTED BY MANAGER'
                                        )
                                      }
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}

                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={7}>No travel requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {page === 'Reimbursements' && (
          <>
            {role === 'Employee' && (
              <section className="content-card">
                <div className="section-heading">
                  <div>
                    <h2>Submit a reimbursement</h2>
                    <p>Upload the bill image with your expense details.</p>
                  </div>
                </div>

                <form className="app-form" onSubmit={submitClaim}>
                  <label>
                    Expense category
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Transport</option>
                      <option>Accommodation</option>
                      <option>Meals</option>
                      <option>Flight</option>
                      <option>Other</option>
                    </select>
                  </label>

                  <label>
                    Amount (₹)
                    <input
                      type="number"
                      min="1"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      placeholder="e.g. 1500"
                      required
                    />
                  </label>

                  <label>
                    Bill date
                    <input
                      type="date"
                      value={billDate}
                      onChange={(e) => setBillDate(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Description
                    <input
                      value={claimDescription}
                      onChange={(e) => setClaimDescription(e.target.value)}
                      placeholder="e.g. Airport taxi receipt"
                      required
                    />
                  </label>

                  <label className="full-width">
                    Upload bill or receipt image
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      required
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;

                        if (
                          !['image/jpeg', 'image/png', 'image/webp'].includes(
                            file.type
                          )
                        ) {
                          setNotice('Choose a JPG, PNG, or WEBP image.');
                          event.target.value = '';
                          return;
                        }

                        if (file.size > 700 * 1024) {
                          setNotice(
                            'Choose an image smaller than 700 KB for this demo.'
                          );
                          event.target.value = '';
                          return;
                        }

                        const reader = new FileReader();

                        reader.onload = () => {
                          setBillImage(String(reader.result));
                          setBillName(file.name);
                          setNotice('');
                        };

                        reader.onerror = () =>
                          setNotice(
                            'Could not read that image. Try another file.'
                          );

                        reader.readAsDataURL(file);
                      }}
                    />
                    <span className="muted">
                      JPG, PNG, or WEBP · Maximum 700 KB
                    </span>
                  </label>

                  {billImage && (
                    <div className="bill-preview full-width">
                      <strong>Receipt preview</strong>
                      <p className="muted">{billName}</p>
                      <img
                        src={billImage}
                        alt="Preview of uploaded expense receipt"
                      />

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setBillImage('');
                          setBillName('');
                        }}
                      >
                        Remove bill
                      </button>
                    </div>
                  )}

                  <button className="primary-button" type="submit">
                    Submit reimbursement →
                  </button>
                </form>
              </section>
            )}

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>
                    {role === 'Finance'
                      ? 'Finance reimbursement review'
                      : role === 'Employee'
                      ? 'My reimbursements'
                      : 'Reimbursement claims'}
                  </h2>
                  <p>
                    Check receipt images, claimed amounts, and payment progress.
                  </p>
                </div>

                <input
                  className="search-input"
                  placeholder="Search claims..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Bill date</th>
                      <th>Amount</th>
                      <th>Receipt</th>
                      <th>Status</th>
                      {role === 'Finance' && <th>Actions</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id}>
                        <td>{claim.employee}</td>
                        <td>{claim.category}</td>
                        <td>{claim.description}</td>
                        <td>{claim.billDate || '—'}</td>
                        <td>{money(claim.amount)}</td>
                        <td>
                          {claim.billImage ? (
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => viewBill(claim)}
                            >
                              View bill ↗
                            </button>
                          ) : (
                            <span className="muted">No bill attached</span>
                          )}
                        </td>
                        <td>
                          <Status value={claim.status} />
                        </td>

                        {role === 'Finance' && (
                          <td>
                            <div className="action-buttons">
                              {claim.status === 'PENDING FINANCE REVIEW' && (
                                <>
                                  <button
                                    className="approve-button"
                                    onClick={() =>
                                      updateClaim(
                                        claim.id,
                                        'APPROVED FOR PAYMENT'
                                      )
                                    }
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="reject-button"
                                    onClick={() =>
                                      updateClaim(
                                        claim.id,
                                        'REJECTED BY FINANCE'
                                      )
                                    }
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {claim.status === 'APPROVED FOR PAYMENT' && (
                                <button
                                  className="approve-button"
                                  onClick={() => updateClaim(claim.id, 'PAID')}
                                >
                                  Mark paid
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}

                    {filteredClaims.length === 0 && (
                      <tr>
                        <td colSpan={8}>No reimbursement claims found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {page === 'Analytics' && (
          <>
            <section className="welcome-banner">
              <div>
                <p className="eyebrow">FINANCE INSIGHTS</p>
                <h2>Expense analytics</h2>
                <p>
                  Monitor submitted claims, payments, and reimbursement status.
                </p>
              </div>
              <div className="banner-icon">▥</div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon teal">₹</span>
                <p>Total claimed</p>
                <h2>
                  {money(
                    role === 'Employee'
                      ? myClaims.reduce((s, c) => s + c.amount, 0)
                      : totalExpenses
                  )}
                </h2>
              </div>

              <div className="stat-card">
                <span className="stat-icon orange">◷</span>
                <p>Pending review</p>
                <h2>{pendingClaims}</h2>
              </div>

              <div className="stat-card">
                <span className="stat-icon purple">✓</span>
                <p>Claims paid</p>
                <h2>{claims.filter((c) => c.status === 'PAID').length}</h2>
              </div>

              <div className="stat-card">
                <span className="stat-icon blue">₹</span>
                <p>Total paid</p>
                <h2>{money(paidExpenses)}</h2>
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Spending by category</h2>
                  <p>Based on submitted reimbursement claims</p>
                </div>
              </div>

              {['Transport', 'Accommodation', 'Meals', 'Flight', 'Other'].map(
                (item) => {
                  const visibleClaims =
                    role === 'Employee'
                      ? myClaims.filter((c) => c.category === item)
                      : claims.filter((c) => c.category === item);

                  const total = visibleClaims.reduce(
                    (sum, c) => sum + c.amount,
                    0
                  );

                  const allTotal =
                    role === 'Employee'
                      ? myClaims.reduce((sum, c) => sum + c.amount, 0)
                      : totalExpenses;

                  const percentage =
                    allTotal > 0 ? (total / allTotal) * 100 : 0;

                  return (
                    <div className="analytics-row" key={item}>
                      <div className="analytics-label">
                        <span>{item}</span>
                        <strong>{money(total)}</strong>
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </section>
          </>
        )}

        <footer className="app-footer">
          VoyageFlow · Travel expense and reimbursement management
        </footer>
      </main>
    </div>
  );
}

export default App;
