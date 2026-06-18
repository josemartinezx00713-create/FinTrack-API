import streamlit as st
import pandas as pd
import io
import xlsxwriter
from datetime import datetime
from ui_tweak import apply_global_css, fmt_money, get_currency, get_rate, get_api_client

st.set_page_config(page_title="Reportes", layout="wide")
apply_global_css()

api = get_api_client()

st.title("Reportes Detallados")

st.subheader("Comparativa Mensual (Últimos 6 meses)")
try:
    trends = api.get_trends(6)
    if trends:
        df_trends = pd.DataFrame(trends)
        rate = get_rate()
        df_trends["income"] = df_trends["income"] * rate
        df_trends["expense"] = df_trends["expense"] * rate
        df_trends["balance"] = df_trends["balance"] * rate

        df_trends.rename(columns={"month": "Mes", "income": "Ingresos", "expense": "Gastos", "balance": "Balance"}, inplace=True)
        df_trends = df_trends.set_index("Mes").T

        st.markdown('<div class="report-card">', unsafe_allow_html=True)
        curr = get_currency()
        st.dataframe(df_trends.style.format(f"{curr}{{:.2f}}"), width="stretch")
        st.markdown("</div>", unsafe_allow_html=True)
    else:
        st.info("No hay datos suficientes.")
except Exception as e:
    st.error(f"Fallo al cargar datos mensuales: {e}")

st.markdown("---")

st.subheader(" Exportar Datos")
st.write("Descarga una copia completa de tus transacciones y análisis visual para el mes seleccionado.")

col1, col2 = st.columns([1, 2])
with col1:
    month_input = st.date_input("Mes a exportar", datetime.now()).strftime("%Y-%m")
with col2:
    st.markdown("<br>", unsafe_allow_html=True)
    try:
        data = api.get_transactions(month_input)
        if data:
            cats = api.get_category_stats(month_input)
            summary = api.get_summary(month_input)

            df_exp = pd.DataFrame(data)
            df_exp_esp = df_exp.copy()
            df_exp_esp["type"] = df_exp_esp["type"].apply(lambda x: "Ingreso" if x == "income" else "Gasto")
            df_exp_esp.rename(columns={
                "id": "ID", "date": "Fecha", "type": "Tipo", "category": "Categoría",
                "description": "Descripción", "amount": "Monto", "currency": "Moneda"
            }, inplace=True)

            buffer = io.BytesIO()
            with pd.ExcelWriter(buffer, engine="xlsxwriter") as writer:
                df_exp_esp.to_excel(writer, sheet_name="Transacciones", index=False, startrow=1, header=False)
                workbook = writer.book
                worksheet1 = writer.sheets["Transacciones"]

                header_format = workbook.add_format({
                    "bold": True, "font_size": 11, "font_color": "white",
                    "fg_color": "#1E293B", "border": 1, "align": "center", "valign": "vcenter"
                })
                cell_format = workbook.add_format({"border": 1, "align": "left"})
                money_format = workbook.add_format({"num_format": '"$"#,##0.00', "border": 1, "align": "right"})

                for col_num, value in enumerate(df_exp_esp.columns.values):
                    worksheet1.write(0, col_num, value, header_format)

                for row_num in range(len(df_exp_esp)):
                    for col_num in range(len(df_exp_esp.columns)):
                        val = df_exp_esp.iloc[row_num, col_num]
                        if df_exp_esp.columns[col_num] == "Monto":
                            worksheet1.write(row_num + 1, col_num, float(val), money_format)
                        else:
                            worksheet1.write(row_num + 1, col_num, val, cell_format)

                for i, col in enumerate(df_exp_esp.columns):
                    column_len = max(df_exp_esp[col].astype(str).map(len).max(), len(col)) + 4
                    worksheet1.set_column(i, i, column_len)

                if cats or summary:
                    worksheet2 = workbook.add_worksheet("Análisis")
                    titulo_format = workbook.add_format({"bold": True, "font_size": 18, "font_color": "#1E293B"})
                    header_format_2 = workbook.add_format({"bold": True, "fg_color": "#3B82F6", "font_color": "white", "border": 1, "align": "center"})
                    cell_format_2 = workbook.add_format({"border": 1, "align": "left"})
                    money_format_2 = workbook.add_format({"num_format": '"$"#,##0.00', "border": 1})

                    worksheet2.hide_gridlines(2)
                    worksheet2.set_column("A:B", 22)
                    worksheet2.write("A1", "Resumen Financiero", titulo_format)

                    row = 3

                    if summary:
                        worksheet2.write(row, 0, "Métrica", header_format_2)
                        worksheet2.write(row, 1, "Valor", header_format_2)
                        worksheet2.write(row+1, 0, "Ingresos", cell_format_2)
                        worksheet2.write_number(row+1, 1, summary.get("income", 0), money_format_2)
                        worksheet2.write(row+2, 0, "Gastos", cell_format_2)
                        worksheet2.write_number(row+2, 1, summary.get("expense", 0), money_format_2)

                        balance = summary.get("balance", 0)
                        bal_color = "#10B981" if balance >= 0 else "#EF4444"
                        bal_format = workbook.add_format({"num_format": '"$"#,##0.00', "border": 1, "font_color": bal_color, "bold": True})
                        worksheet2.write(row+3, 0, "Balance", cell_format_2)
                        worksheet2.write_number(row+3, 1, balance, bal_format)

                        chart_bar = workbook.add_chart({"type": "column"})
                        chart_bar.add_series({
                            "name": "Finanzas Mensuales",
                            "categories": ["Análisis", row+1, 0, row+2, 0],
                            "values": ["Análisis", row+1, 1, row+2, 1],
                            "points": [{"fill": {"color": "#10B981"}}, {"fill": {"color": "#EF4444"}}],
                            "data_labels": {"value": True}
                        })
                        chart_bar.set_title({"name": "Ingresos vs Gastos", "name_font": {"size": 14, "bold": True}})
                        chart_bar.set_legend({"none": True})
                        chart_bar.set_y_axis({"visible": False})
                        worksheet2.insert_chart("D2", chart_bar, {"x_scale": 1.1, "y_scale": 1.2})
                        row += 6

                    if cats:
                        worksheet2.write(row, 0, "Categoría", header_format_2)
                        worksheet2.write(row, 1, "Monto", header_format_2)
                        cat_start = row + 1
                        current_row = cat_start
                        for cat, amount in cats.items():
                            worksheet2.write(current_row, 0, cat, cell_format_2)
                            worksheet2.write_number(current_row, 1, amount * get_rate(), money_format_2)
                            current_row += 1
                        cat_end = current_row - 1

                        if cat_end >= cat_start:
                            chart_pie = workbook.add_chart({"type": "pie"})
                            chart_pie.add_series({
                                "name": "Gastos por Categoría",
                                "categories": ["Análisis", cat_start, 0, cat_end, 0],
                                "values": ["Análisis", cat_start, 1, cat_end, 1],
                                "data_labels": {"percentage": True, "leader_lines": True}
                            })
                            chart_pie.set_title({"name": "Distribución de Gastos", "name_font": {"size": 14, "bold": True}})
                            chart_pie.set_style(10)
                            worksheet2.insert_chart("D19", chart_pie, {"x_scale": 1.3, "y_scale": 1.2})

            buffer.seek(0)
            st.download_button(
                label="Descargar Reporte Excel", data=buffer,
                file_name=f"Reporte del dia {month_input}.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                type="primary"
            )
        else:
            st.write("No se encontraron transacciones para este mes.")
    except Exception as e:
        st.write(f"Error cargando los datos para la exportación: {e}")
