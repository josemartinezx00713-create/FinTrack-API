import streamlit as st
import pandas as pd
from datetime import datetime
from di_container import apply_global_css, get_container

st.set_page_config(page_title="Metas de Ahorro", layout="wide")
apply_global_css()

container = get_container()
fetcher = container.data_fetcher
currency = container.currency_service

st.title("Metas de Ahorro")

with st.sidebar.expander("Añadir Nueva Meta"):
    with st.form("new_goal"):
        g_name = st.text_input("Nombre de la Meta")
        g_target = st.number_input("Monto Objetivo Numérico", min_value=0.01, value=None, step=10.0)
        g_deadline = st.date_input("Fecha Límite")
        if st.form_submit_button("Crear Meta"):
            if g_target is None:
                st.error("Por favor, introduce un monto válido.")
            else:
                try:
                    fetcher.create_goal({"name": g_name, "target": g_target, "deadline": g_deadline.strftime("%Y-%m-%d")})
                    st.success("Meta añadida.")
                    st.cache_data.clear()
                    st.rerun()
                except Exception as e:
                    st.error("Error al crear meta.")

goals = fetcher.get_goals()

if not goals:
    st.info("No hay metas en caché local o el API no devolvió datos.")

if goals:
    cols = st.columns(3)
    for idx, g in enumerate(goals):
        with cols[idx % 3]:
            target = g["target"]
            current = g.get("current", 0)
            pct = min((current / target) * 100 if target > 0 else 0, 100)

            dl = datetime.strptime(g["deadline"], "%Y-%m-%d")
            days_left = (dl - datetime.now()).days

            completed_style = "style='border-color: #10B981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);'" if pct >= 100 else ""
            st.markdown(f"""
<div class="goal-card" {completed_style}>
    <div class="goal-title">{g["name"]}</div>
    <div class="goal-amounts">
        <span>Ahorrado: <span class="goal-amount-val">{currency.fmt_html_money(current)}</span></span>
        <span>Meta: {currency.fmt_html_money(target)}</span>
    </div>
    <div class="progress-track">
        <div class="progress-fill" style="width: {pct}%;"></div>
    </div>
    <div class="progress-pct">{"★ " if pct >= 100 else ""}{pct:.1f}% Completado</div>
    <div class="goal-deadline">Límite: {g["deadline"]} (Faltan {max(0, days_left)} días)</div>
</div>
<br>""", unsafe_allow_html=True)

            if pct >= 100 and not st.session_state.get(f"balloons_{g['id']}"):
                st.balloons()
                st.session_state[f"balloons_{g['id']}"] = True

    st.markdown("---")
    st.markdown("### Gestionar Metas")
    st.caption("Selecciona una meta pendiente para añadirle fondos o eliminarla.")

    df = pd.DataFrame(goals)
    df_view = df.copy()
    df_view.insert(0, "Seleccionar", False)
    df_view["Meta"] = df_view["target"].apply(currency.fmt_money)
    df_view["Ahorrado"] = df_view["current"].apply(currency.fmt_money)
    df_view["Progreso"] = df_view.apply(lambda row: f"{(row['current'] / row['target'] * 100 if row['target'] > 0 else 0):.1f}%", axis=1)

    df_view = df_view[["Seleccionar", "id", "name", "Ahorrado", "Meta", "Progreso", "deadline"]]
    df_view.rename(columns={"id": "ID_Oculto", "name": "Nombre", "deadline": "Límite"}, inplace=True)

    edited_df = st.data_editor(
        df_view, width="stretch", hide_index=True,
        disabled=["Nombre", "Ahorrado", "Meta", "Progreso", "Límite"],
        column_config={
            "Seleccionar": st.column_config.CheckboxColumn("Seleccionar", default=False),
            "ID_Oculto": None
        }
    )

    selected_goals = edited_df[edited_df["Seleccionar"] == True]
    if len(selected_goals) == 1:
        row = selected_goals.iloc[0]
        st.markdown("---")
        st.subheader(f" Opción Seleccionada: {row['Nombre']}")

        with st.container(border=True):
            with st.form("goal_interaction"):
                st.markdown("Añadir Fondos al ahorro guardado:")
                deposit = st.number_input("Cantidad a Depositar", min_value=0.1, step=10.0)

                st.markdown("<br>", unsafe_allow_html=True)
                cA, cB = st.columns([1, 10])
                with cA:
                    if st.form_submit_button("Depositar", type="primary"):
                        try:
                            fetcher.deposit_to_goal(row["ID_Oculto"], deposit)
                            st.success("Depósito exitoso")
                            st.cache_data.clear()
                            st.rerun()
                        except Exception as e:
                            st.error("Error al depositar.")
                with cB:
                    if st.form_submit_button("Eliminar Meta"):
                        try:
                            fetcher.delete_goal(row["ID_Oculto"])
                            st.success("Meta eliminada exitosamente")
                            st.cache_data.clear()
                            st.rerun()
                        except Exception as e:
                            st.error("Error al eliminar meta.")
    elif len(selected_goals) > 1:
        st.markdown("---")
        st.subheader(f"{len(selected_goals)} Metas Seleccionadas")
        with st.container(border=True):
            st.info("Has seleccionado múltiples metas. Los depósitos simultáneos no están permitidos.")
            with st.form("bulk_delete_goal"):
                if st.form_submit_button("Eliminar Seleccionadas"):
                    try:
                        ids = [r["ID_Oculto"] for _, r in selected_goals.iterrows()]
                        fetcher.bulk_delete_goals(ids)
                        st.success("Metas eliminadas.")
                        st.cache_data.clear()
                        st.rerun()
                    except Exception as e:
                        st.error("Error al eliminar metas.")
else:
    st.info("No tienes metas de ahorro actualmente. ¡Comienza planeando un viaje o ahorrando para algo que te guste!")
