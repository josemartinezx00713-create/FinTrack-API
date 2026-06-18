import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


PALETTE = ["#00d4aa", "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff922b"]


def render_kpi_card(col, label, value, delta_html, card_class, icon, icon_color):
    col.markdown(
        f'<div class="metric-card {card_class}">'
        f'<div class="metric-label">'
        f'<span class="material-symbols-rounded icon" style="color:{icon_color};font-size:1.2rem;">{icon}</span>'
        f" {label} {delta_html}</div>"
        f'<div class="metric-value">{value}</div></div>',
        unsafe_allow_html=True
    )


def render_donut_chart(cat_stats, fmt_money_func):
    if cat_stats and len(cat_stats) > 0:
        df_cat = pd.DataFrame(list(cat_stats.items()), columns=["Categoría", "Cantidad"])
        df_cat["Cantidad"] = df_cat["Cantidad"]
        fig = px.pie(
            df_cat, values="Cantidad", names="Categoría", hole=0.65,
            color_discrete_sequence=["#F43F5E", "#FBBF24", "#10B981", "#3B82F6", "#8B5CF6", "#F97316"]
        )
        fig.update_layout(
            paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
            font_color="#D1D5DB", margin=dict(t=0, b=0, l=0, r=0),
            legend=dict(orientation="v", yanchor="middle", y=0.5, xanchor="left", x=1.0)
        )
        fig.update_traces(
            textinfo="none", hoverinfo="label+percent+value",
            marker=dict(line=dict(color="#1A1A1E", width=4))
        )
        st.plotly_chart(fig, width="stretch")
    else:
        st.info("No hay datos de gastos para este mes.")


def render_trend_chart(trends, rate):
    if trends:
        df_trends = pd.DataFrame(trends)
        df_trends["income"] = df_trends["income"] * rate
        df_trends["expense"] = df_trends["expense"] * rate
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=df_trends["month"], y=df_trends["income"], name="Ingresos",
            mode="lines", line=dict(color="#10B981", width=3, shape="spline"),
            fill="tozeroy", fillcolor="rgba(16, 185, 129, 0.1)"
        ))
        fig.add_trace(go.Scatter(
            x=df_trends["month"], y=df_trends["expense"], name="Gastos",
            mode="lines", line=dict(color="#EF4444", width=3, shape="spline"),
            fill="tozeroy", fillcolor="rgba(239, 68, 68, 0.1)"
        ))
        fig.update_layout(
            paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
            font_color="#9CA3AF", margin=dict(l=0, r=0, t=30, b=0),
            hovermode="x unified",
            legend=dict(orientation="h", yanchor="bottom", y=1.05, xanchor="center", x=0.5)
        )
        fig.update_xaxes(showgrid=False, zeroline=False, tickfont=dict(color="#9CA3AF"))
        fig.update_yaxes(showgrid=False, zeroline=False, tickfont=dict(color="#9CA3AF"))
        st.plotly_chart(fig, width="stretch")
    else:
        st.info("No hay datos de tendencia disponibles.")


def render_top_expenses(top_exp, total_exp, fmt_money_func):
    if top_exp:
        if total_exp == 0:
            total_exp = 1
        for item in top_exp:
            pct = (item["amount"] / total_exp) * 100
            if pct > 100:
                pct = 100
            desc = item["description"]
            if len(desc) > 25:
                desc = desc[:22] + "..."
            st.markdown(f"""
            <div class="top-expense-row">
                <div class="top-expense-label">{desc}</div>
                <div class="top-expense-bar-bg">
                    <div class="top-expense-bar-fill" style="width: {pct}%;"></div>
                </div>
                <div class="top-expense-amount">{fmt_money_func(item["amount"])}</div>
                <div class="top-expense-pct">{pct:.0f}%</div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.info("No se encontraron gastos vinculados.")
