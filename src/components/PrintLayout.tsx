import { useEffect, useRef } from 'react';
import { Comanda } from '../types';
import { formatCurrency } from '../lib/utils';
import JsBarcode from 'jsbarcode';

interface PrintLayoutProps {
  comanda: Comanda;
  format: 'a4' | 'thermal';
}

const LOGO_URL = "https://i.imgur.com/zUZ7WJN.png";

export default function PrintLayout({ comanda, format }: PrintLayoutProps) {
  const isThermal = format === 'thermal';
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, comanda.code, {
        format: "CODE128",
        width: isThermal ? 1.5 : 2,
        height: isThermal ? 40 : 60,
        displayValue: false,
        margin: 0
      });
    }
  }, [comanda.code, isThermal]);

  if (isThermal) {
    return (
      <div className="print-thermal" style={{ backgroundColor: 'white', color: 'black' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img 
            src={LOGO_URL} 
            alt="Logo" 
            style={{ height: '50px', marginBottom: '10px', filter: 'grayscale(1)' }}
            referrerPolicy="no-referrer"
          />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>TRILHA TECNOLOGIA</h2>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 'bold', opacity: 0.7 }}>SISTEMAS DE GESTÃO</p>
        </div>
        
        <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '15px 0', margin: '15px 0', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>COMANDA FÍSICA</p>
          <p style={{ margin: '0', fontSize: '32px', fontWeight: '900', fontFamily: 'monospace' }}>{comanda.code}</p>
          <div style={{ margin: '15px 0', display: 'flex', justifyContent: 'center' }}>
            <svg ref={barcodeRef}></svg>
          </div>
          <p style={{ margin: '5px 0 0 0', fontSize: '10px', opacity: 0.6 }}>{new Date(comanda.createdAt).toLocaleString('pt-BR')}</p>
        </div>

        <div style={{ margin: '15px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '5px', fontSize: '11px', fontWeight: 'bold' }}>
            <span>DESCRIÇÃO</span>
            <span>VALOR</span>
          </div>
          {comanda.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '4px 0' }}>
              <span style={{ flex: 1 }}>{item.code ? `#${item.code} ` : ''}{item.quantity}x {item.name}</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '2px solid #000', marginTop: '15px', paddingTop: '10px', textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>TOTAL: {formatCurrency(comanda.total)}</p>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '11px' }}>
          <p style={{ margin: '2px 0', fontWeight: 'bold' }}>Apresente este ticket no caixa</p>
          <p style={{ margin: '2px 0' }}>Obrigado pela preferência!</p>
          <div style={{ marginTop: '15px', fontSize: '9px', opacity: 0.5 }}>
            PDV TRILHA TECNOLOGIA
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="print-a4" style={{ backgroundColor: 'white', color: 'black', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px', borderBottom: '4px solid #0F172A', paddingBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <img 
            src={LOGO_URL} 
            alt="Logo" 
            style={{ height: '90px' }}
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 style={{ margin: 0, color: '#0F172A', fontSize: '48px', fontWeight: '900', letterSpacing: '-2px' }}>TRILHA</h1>
            <p style={{ margin: 0, color: '#06B6D4', fontWeight: '800', letterSpacing: '6px', textTransform: 'uppercase', fontSize: '16px' }}>Tecnologia</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ backgroundColor: '#0F172A', color: 'white', padding: '20px 40px', borderRadius: '24px', marginBottom: '15px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '2px' }}>Comanda Física</p>
            <h2 style={{ margin: 0, fontSize: '42px', fontFamily: 'monospace', fontWeight: '900' }}>#{comanda.code}</h2>
          </div>
          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
            <svg ref={barcodeRef}></svg>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontWeight: '700', fontSize: '14px' }}>{new Date(comanda.createdAt).toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
          <div style={{ width: '50px', height: '6px', backgroundColor: '#06B6D4', borderRadius: '3px' }}></div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Resumo de Consumo</h3>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '15px 25px', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '800' }}>Descrição</th>
              <th style={{ textAlign: 'center', padding: '15px 25px', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '800' }}>Qtd</th>
              <th style={{ textAlign: 'right', padding: '15px 25px', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '800' }}>Unitário</th>
              <th style={{ textAlign: 'right', padding: '15px 25px', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '800' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {comanda.items.map((item, idx) => (
              <tr key={idx} style={{ backgroundColor: '#f8fafc' }}>
                <td style={{ padding: '25px', borderRadius: '24px 0 0 24px', fontWeight: '800', color: '#1e293b', fontSize: '16px' }}>
                  {item.code && <span style={{ color: '#06B6D4', marginRight: '10px' }}>#{item.code}</span>}
                  {item.name}
                </td>
                <td style={{ textAlign: 'center', padding: '25px', fontWeight: '700', color: '#64748b', fontSize: '16px' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '25px', fontWeight: '700', color: '#64748b', fontSize: '16px' }}>{formatCurrency(item.price)}</td>
                <td style={{ textAlign: 'right', padding: '25px', borderRadius: '0 24px 24px 0', fontWeight: '900', color: '#0F172A', fontSize: '18px' }}>{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '60px' }}>
        <div style={{ backgroundColor: '#0F172A', padding: '50px', borderRadius: '48px', minWidth: '350px', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px' }}>Subtotal Bruto</span>
            <span style={{ fontWeight: '700', color: 'white', fontSize: '18px' }}>{formatCurrency(comanda.total)}</span>
          </div>
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '25px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'white', fontWeight: '900', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Geral</span>
            <span style={{ fontWeight: '900', fontSize: '48px', color: '#06B6D4', letterSpacing: '-2px' }}>{formatCurrency(comanda.total)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '150px', borderTop: '2px solid #f1f5f9', paddingTop: '50px', textAlign: 'center' }}>
        <p style={{ margin: '8px 0', color: '#1e293b', fontWeight: '800', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>Obrigado pela preferência</p>
        <p style={{ margin: '8px 0', color: '#94a3b8', fontWeight: '600' }}>Este documento é um controle interno de consumo.</p>
        <p style={{ margin: '8px 0', color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold' }}>SISTEMA DESENVOLVIDO POR TRILHA TECNOLOGIA - WWW.TRILHATECNOLOGIA.COM.BR</p>
      </div>
    </div>
  );
}
