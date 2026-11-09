from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from config import Config

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
db = SQLAlchemy(app)

class Venta(db.Model):
    __tablename__ = 'ventas'
    id = db.Column(db.Integer, primary_key=True)
    nombre_cliente = db.Column(db.String(100))
    direccion = db.Column(db.String(200))
    telefono = db.Column(db.String(20))
    fecha_compra = db.Column(db.Date)
    total = db.Column(db.Numeric(10,2))

class DetalleVenta(db.Model):
    __tablename__ = 'detalle_ventas'
    id = db.Column(db.Integer, primary_key=True)
    venta_id = db.Column(db.Integer, db.ForeignKey('ventas.id'))
    tamano = db.Column(db.String(50))
    ingredientes = db.Column(db.String(200))
    num_pizzas = db.Column(db.Integer)
    subtotal = db.Column(db.Numeric(10,2))

@app.route('/api/ventas', methods=['POST'])
def registrar_venta():
    data = request.json
    try:
        print("Datos recibidos:", data)
        total_calculado = sum(float(d['subtotal']) for d in data['detalles'])

        nueva_venta = Venta(
            nombre_cliente=data['nombre'],
            direccion=data['direccion'],
            telefono=data['telefono'],
            fecha_compra=datetime.strptime(data['fecha'], '%Y-%m-%d').date(),
            total=total_calculado
        )
        db.session.add(nueva_venta)
        db.session.commit()

        for detalle in data['detalles']:
            ingredientes_str = ', '.join(detalle['ingredientes']) if detalle['ingredientes'] else 'Sin ingredientes'
            
            nuevo_detalle = DetalleVenta(
                venta_id=nueva_venta.id,
                tamano=str(detalle['tamano']),
                ingredientes=ingredientes_str,
                num_pizzas=int(detalle['num_pizzas']),
                subtotal=float(detalle['subtotal'])
            )
            db.session.add(nuevo_detalle)
            
        db.session.commit()
        return jsonify({'mensaje': 'Venta registrada con éxito', 'total': total_calculado}), 201

    except Exception as e:
        db.session.rollback()
        print("ERROR EN EL BACKEND:", str(e))
        return jsonify({'error': str(e)}), 400

# Ruta para consultar ventas por día (ej. 'lunes', 'martes' o fecha '2026-11-23')
@app.route('/api/ventas/dia/<string:dia>', methods=['GET'])
def ventas_por_dia(dia):
    try:
        dia_buscado = dia.lower().strip()
        todas_ventas = Venta.query.all()
        
        dias_semana = {
            0: 'lunes',
            1: 'martes',
            2: 'miercoles',
            3: 'jueves',
            4: 'viernes',
            5: 'sabado',
            6: 'domingo'
        }
        
        resultado = []
        total_dia = 0
        for v in todas_ventas:
            dia_num = v.fecha_compra.weekday()
            nombre_dia = dias_semana[dia_num]
            
            # Coincide si escriben el día de la semana o la fecha exacta en formato YYYY-MM-DD
            if dia_buscado in nombre_dia or nombre_dia in dia_buscado or dia_buscado == v.fecha_compra.strftime('%Y-%m-%d'):
                resultado.append({
                    'id': v.id,
                    'cliente': v.nombre_cliente,
                    'total': float(v.total),
                    'fecha': v.fecha_compra.strftime('%Y-%m-%d')
                })
                total_dia += float(v.total)
            
        return jsonify({'ventas': resultado, 'totalGeneral': total_dia}), 200
    except Exception as e:
        print("ERROR EN DIA:", str(e))
        return jsonify({'error': str(e)}), 400

# Ruta para consultar ventas por mes (ej. 'noviembre')
@app.route('/api/ventas/mes/<string:mes>', methods=['GET'])
def ventas_por_mes(mes):
    try:
        mes_buscado = mes.lower().strip()
        meses_dict = {
            'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
            'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
            'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
        }
        
        mes_num = meses_dict.get(mes_buscado)
        todas_ventas = Venta.query.all()
        
        resultado = []
        total_mes = 0
        for v in todas_ventas:
            if mes_num and v.fecha_compra.month == mes_num:
                resultado.append({
                    'id': v.id,
                    'cliente': v.nombre_cliente,
                    'total': float(v.total),
                    'fecha': v.fecha_compra.strftime('%Y-%m-%d')
                })
                total_mes += float(v.total)
            elif not mes_num:
                # Si no encuentra coincidencia exacta de mes, muestra todo como respaldo
                resultado.append({
                    'id': v.id,
                    'cliente': v.nombre_cliente,
                    'total': float(v.total),
                    'fecha': v.fecha_compra.strftime('%Y-%m-%d')
                })
                total_mes += float(v.total)
            
        return jsonify({'ventas': resultado, 'totalGeneral': total_mes}), 200
    except Exception as e:
        print("ERROR EN MES:", str(e))
        return jsonify({'error': str(e)}), 400

# Ruta para obtener el detalle de una venta específica
@app.route('/api/ventas/<int:id>/detalle', methods=['GET'])
def detalle_venta(id):
    try:
        venta = Venta.query.get_or_404(id)
        detalles = DetalleVenta.query.filter_by(venta_id=venta.id).all()
        
        detalles_list = [{
            'tamano': d.tamano,
            'ingredientes': d.ingredientes,
            'num_pizzas': d.num_pizzas,
            'subtotal': float(d.subtotal)
        } for d in detalles]
        
        return jsonify({
            'cliente': venta.nombre_cliente,
            'detalles': detalles_list
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)