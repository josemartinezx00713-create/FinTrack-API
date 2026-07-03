import streamlit as st
import pandas as pd
from datetime import datetime
from di_container import apply_global_css, get_container
from models.config import CATEGORIAS, CATEGORIAS_INGRESO, CATEGORIAS_GASTO

st.set_page_config(page_title="Transacciones", layout="wide")
apply_global_css()

container = get_container()
fetcher = container.data_fetcher
currency = container.currency_service

st.title("Transacciones")

col1, col2, col3, col4 = st.columns(4)
with col1:
    month_input = st.date_input("Mes (Usa el calendario)", datetime.now()).strftime("%Y-%m")
with col2:
    type_map = {"Todos": "", "Ingresos": "income", "Gastos": "expense"}
    type_display = st.selectbox("Tipo", list(type_map.keys()))
    type_input = type_map[type_display]
with col3:
    cat_input = st.selectbox("Categoría", ["Todas"] + CATEGORIAS)
with col4:
    search_input = st.text_input("Buscar Descripción", "")

with st.sidebar.expander(" Añadir Transacción", expanded=False):
    t_type_display = st.radio("Tipo de Transacción", ["Gastos", "Ingresos"], horizontal=True)
    t_type = "expense" if t_type_display == "Gastos" else "income"
    opciones_cat = CATEGORIAS_GASTO if t_type == "expense" else CATEGORIAS_INGRESO
    
    with st.form("add_transaction_form"):
        t_amount = st.number_input(f"Monto ({currency.get_currency_symbol()})", min_value=0.01, step=0.01)
        t_cat = st.selectbox("Categoría", opciones_cat)
        t_desc = st.text_input("Descripción")
        t_date = st.date_input("Fecha")
        submitted = st.form_submit_button("Añadir")

        if submitted:
            payload = {
                "amount": currency.to_base(t_amount), "type": t_type, "category": t_cat,
                "description": t_desc, "date": t_date.strftime("%Y-%m-%d"), "currency": "C$"
            }
            try:
                fetcher.create_transaction(payload)
                st.success("¡Transacción añadida exitosamente!")
                st.cache_data.clear()
                st.rerun()
            except Exception as e:
                st.error("Error de conexión al añadir transacción.")

data = fetcher.get_transactions(month_input, cat_input if cat_input != "Todas" else "", type_input)

if not data:
    st.info("No hay datos disponibles en caché local.")

if data:
    df = pd.DataFrame(data)
    if search_input:
        df = df[df["description"].str.contains(search_input, case=False, na=False)]

    if df.empty:
        st.info("No hay resultados para esta búsqueda.")
    else:
        df_view = df.copy()
        df_view["type"] = df_view["type"].apply(lambda x: "Ingreso" if x == "income" else "Gasto")
        df_view["amount"] = pd.to_numeric(df_view["amount"])
        df_view["Monto Format"] = df_view["amount"].apply(currency.fmt_money)
        df_view.insert(0, "Seleccionar", False)
        df_view = df_view[["Seleccionar", "id", "date", "type", "category", "description", "amount", "Monto Format", "currency"]]
        df_view.rename(columns={
            "id": "ID_Oculto", "date": "Fecha", "type": "Clase", "category": "Categoría",
            "description": "Descripción", "amount": "Monto_Original"
        }, inplace=True)

        st.markdown("###  Tus Transacciones")
        st.caption("Marca la casilla 'Seleccionar' en un registro para ver más detalles o editarlo.")

        edited_df = st.data_editor(
            df_view, width="stretch", hide_index=True,
            disabled=["Fecha", "Clase", "Categoría", "Descripción", "Monto Format"],
            column_config={
                "Seleccionar": st.column_config.CheckboxColumn(" Ver/Editar", help="Selecciona para interactuar", default=False),
                "ID_Oculto": None, "Monto_Original": None, "currency": None
            }
        )

        selected = edited_df[edited_df["Seleccionar"] == True]

        if len(selected) == 1:
            row = selected.iloc[0]
            selected_id = row["ID_Oculto"]

            st.markdown("---")
            st.subheader(" Detalles de la Transacción")

            with st.container(border=True):
                with st.form("update_tx_form"):
                    cA, cB, cC = st.columns(3)
                    with cA:
                        u_desc = st.text_input("Descripción", value=row["Descripción"])
                        u_monto = st.number_input(f"Monto ({currency.get_currency_symbol()})", value=float(currency.from_base(row["Monto_Original"])), step=0.01)
                    with cB:
                        cat_index = CATEGORIAS.index(row["Categoría"]) if row["Categoría"] in CATEGORIAS else 0
                        u_cat = st.selectbox("Categoría", CATEGORIAS, index=cat_index)
                        tipo_idx = 0 if row["Clase"] == "Ingreso" else 1
                        u_tipo = st.selectbox("Clase", ["Ingreso", "Gasto"], index=tipo_idx)
                    with cC:
                        f_date = datetime.strptime(row["Fecha"], "%Y-%m-%d").date() if isinstance(row["Fecha"], str) else row["Fecha"]
                        u_fecha = st.date_input("Fecha", value=f_date)

                    st.markdown("<br>", unsafe_allow_html=True)
                    colBtn1, colBtn2 = st.columns([1, 10])

                    with colBtn1:
                        if st.form_submit_button(" Guardar", type="primary"):
                            payload = {
                                "description": u_desc, "amount": currency.to_base(u_monto),
                                "category": u_cat, "type": "income" if u_tipo == "Ingreso" else "expense",
                                "date": u_fecha.strftime("%Y-%m-%d")
                            }
                            try:
                                fetcher.update_transaction(selected_id, payload)
                                st.success("¡Transacción actualizada!")
                                st.cache_data.clear()
                                st.rerun()
                            except Exception as e:
                                st.error("Error de conexión al actualizar.")

                    with colBtn2:
                        if st.form_submit_button(" Eliminar"):
                            try:
                                fetcher.delete_transaction(selected_id)
                                st.success("Transacción eliminada exitosamente.")
                                st.cache_data.clear()
                                st.rerun()
                            except Exception as e:
                                st.error("Error de conexión al eliminar.")

        elif len(selected) > 1:
            st.markdown("---")
            st.subheader(f"{len(selected)} Transacciones Seleccionadas")
            with st.container(border=True):
                st.info("Has seleccionado múltiples elementos. La edición simultánea no está permitida.")
                with st.form("bulk_delete_tx"):
                    if st.form_submit_button("Eliminar Seleccionadas"):
                        try:
                            ids = [r["ID_Oculto"] for _, r in selected.iterrows()]
                            fetcher.bulk_delete_transactions(ids)
                            st.success("Transacciones eliminadas.")
                            st.cache_data.clear()
                            st.rerun()
                        except Exception as e:
                            st.error("Error de conexión al eliminar.")
else:
    st.info("No se encontraron transacciones. ¡Añade algunas desde el panel lateral!")
