import streamlit as st


def apply_global_css():
    st.markdown("""
<style>
    section[data-testid="stSidebar"] {
        background-color: #121214 !important;
        border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
    }
    [data-testid="stSidebarNav"] {
        padding-top: 1rem;
    }
    [data-testid="stSidebarNav"]::before {
        content: "FinTrack";
        font-weight: 700;
        font-size: 1.6rem;
        color: #FFFFFF;
        display: block;
        padding-left: 1.5rem;
        margin-bottom: 2rem;
        letter-spacing: -0.5px;
    }
    [data-testid="stSidebarNavItems"] {
        gap: 6px;
        display: flex;
        flex-direction: column;
    }
    [data-testid="stSidebarNav"] a {
        padding: 0.8rem 1.2rem !important;
        margin: 0 1rem !important;
        border-radius: 10px !important;
        background-color: transparent !important;
        transition: all 0.2s !important;
    }
    [data-testid="stSidebarNav"] a span {
        color: #9CA3AF !important;
        font-weight: 500 !important;
        font-size: 1.05rem !important;
    }
    [data-testid="stSidebarNav"] a:hover {
        background-color: #1F2937 !important;
    }
    [data-testid="stSidebarNav"] a[aria-current="page"] {
        background-color: #27272A !important;
    }
    [data-testid="stSidebarNav"] a[aria-current="page"] span {
        color: #FFFFFF !important;
        font-weight: 600 !important;
    }
    [data-testid="stSidebarNav"] a[aria-current="page"]::before {
        display: none !important;
    }
    .delta-badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-left: 10px;
        vertical-align: middle;
    }
    .delta-positive { background-color: rgba(16, 185, 129, 0.15); color: #10B981; }
    .delta-negative { background-color: rgba(239, 68, 68, 0.15); color: #EF4444; }
    .delta-neutral { background-color: rgba(156, 163, 175, 0.15); color: #9CA3AF; }
    .stApp {
        background: #0F0F12 !important;
    }
    .metric-card {
        background: #1A1A1E;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        margin-bottom: 20px;
    }
    .card-income { border: 1px solid rgba(16, 185, 129, 0.4); box-shadow: 0 4px 20px -2px rgba(16, 185, 129, 0.1); }
    .card-expense { border: 1px solid rgba(239, 68, 68, 0.4); box-shadow: 0 4px 20px -2px rgba(239, 68, 68, 0.1); }
    .card-balance { border: 1px solid rgba(20, 184, 166, 0.4); box-shadow: 0 4px 20px -2px rgba(20, 184, 166, 0.1); }
    .card-savings { border: 1px solid rgba(20, 184, 166, 0.4); box-shadow: 0 4px 20px -2px rgba(20, 184, 166, 0.1); }
    .metric-label {
        font-size: 0.95rem;
        font-weight: 500;
        color: #9CA3AF;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .metric-value {
        font-size: 2.2rem;
        font-weight: 700;
        color: white;
    }
    .section-card {
        background: #1A1A1E;
        border-radius: 12px;
        padding: 24px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        height: 100%;
        margin-bottom: 20px;
    }
    .top-expense-row {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
    }
    .top-expense-label { width: 140px; font-size: 0.9rem; color: #D1D5DB; }
    .top-expense-bar-bg { flex-grow: 1; background: #27272A; height: 8px; border-radius: 4px; margin: 0 16px; overflow: hidden;}
    .top-expense-bar-fill { background: #F87171; height: 100%; border-radius: 4px;}
    .top-expense-amount { width: 90px; text-align: right; font-size: 0.9rem; color: #D1D5DB; font-weight: 500; }
    .top-expense-pct { width: 45px; text-align: right; font-size: 0.8rem; color: #9CA3AF; }

    /* Presupuestos */
    .budget-card {
        background: #1A1A1E; border-radius: 12px; padding: 20px; margin-bottom: 20px;
        border-left: 4px solid #10B981; border-right: 1px solid rgba(255,255,255,0.05);
        border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05);
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .budget-card:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
    .budget-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 5px; }
    .budget-limits { color: #9CA3AF; font-size: 0.9rem; }
    .budget-stats { text-align: right; margin-top: 8px; font-size: 0.9rem; font-weight: 600; }
    .bar-container { width: 100%; background-color: #27272A; border-radius: 8px; margin-top: 15px; overflow: hidden; }
    .bar-fill { height: 12px; border-radius: 8px; transition: width 0.5s ease-out; }

    /* Metas de Ahorro */
    .goal-card {
        background: #1A1A1E; border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px; padding: 24px; transition: transform 0.2s;
        height: 100%; display: flex; flex-direction: column;
    }
    .goal-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.4); border: 1px solid rgba(16, 185, 129, 0.3); }
    .goal-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 12px; }
    .goal-amounts { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 1rem; color: #9CA3AF; }
    .goal-amount-val { font-weight: 600; color: #10B981; }
    .goal-deadline { margin-top: 15px; font-size: 0.85rem; color: #6B7280; text-align: center; }
    .progress-track { width: 100%; background-color: #27272A; border-radius: 10px; height: 12px; margin: 10px 0; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #10B981, #14B8A6); border-radius: 10px; transition: width 0.8s ease-in-out; }
    .progress-pct { text-align: right; font-size: 0.8rem; font-weight: bold; color: #F9FAFB; }

    /* Reportes */
    .report-card { background: #1A1A1E; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; margin-bottom: 20px; }
</style>
""", unsafe_allow_html=True)
