import React, { useState, useEffect } from 'react';

const TableauReact = () => {
  const [loyer, setLoyer] = useState(120);//à definir via BD
  const [loyerMeuble, setLoyerMeuble] = useState(170);//à definir via BD
  const [total, setTotal] = useState(0);
  const [secondTotal, setSecondTotal] = useState(0);
  const [tauxImpot, setTauxImpot] = useState(0);
  const [impot1, setImpot1] = useState(0);
  const [impot2, setImpot2] = useState(0);
  const [impot3, setImpot3] = useState(0);
  const [impot4, setImpot4] = useState(0);
  const [rows1, setRows1] = useState([]);
  const [rows2, setRows2] = useState([]);

  useEffect(() => {
    updateAllImpots();
  }, [loyer, loyerMeuble, total, secondTotal, tauxImpot]);

  const updateAllImpots = () => {
    const calculImpot1 = (loyer * 0.5) * (0.172 + tauxImpot / 100);
    const calculImpot2 = (loyer - total) * (0.172 + tauxImpot / 100);
    const calculImpot3 = (loyerMeuble * 0.5) * (0.172 + tauxImpot / 100);
    const calculImpot4 = (loyerMeuble - secondTotal) * (0.172 + tauxImpot / 100);

    setImpot1(calculImpot1.toFixed(2));
    setImpot2(calculImpot2 < 0 ? '0 (Déduction : ' + (-calculImpot2).toFixed(2) + ' euros)' : calculImpot2.toFixed(2));
    setImpot3(calculImpot3.toFixed(2));
    setImpot4(calculImpot4 < 0 ? '0 (Déduction : ' + (-calculImpot4).toFixed(2) + ' euros)' : calculImpot4.toFixed(2));
  };

  const handleTauxChange = (e) => {
    setTauxImpot(parseFloat(e.target.value));
  };

  const addRow = (setRowsFunc, setTotalFunc, motifId, tarifId) => {
    const motif = document.getElementById(motifId).value.trim();
    const tarif = parseFloat(document.getElementById(tarifId).value.trim());
    if (motif && !isNaN(tarif)) {
      setRowsFunc((prevRows) => [...prevRows, { motif, tarif }]);
      setTotalFunc((prevTotal) => prevTotal + tarif);
      document.getElementById(motifId).value = '';
      document.getElementById(tarifId).value = '';
      updateAllImpots();
    }
  };

  const removeRow = (index, setRowsFunc, setTotalFunc, rows) => {
    const montant = rows[index].tarif;
    setRowsFunc((prevRows) => prevRows.filter((_, i) => i !== index));
    setTotalFunc((prevTotal) => prevTotal - montant);
    updateAllImpots();
  };

  return (
    <div style={{ width: '80%', margin: 'auto', marginTop: '20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black' }}>
        <tbody>
          <tr style={{ height: '100px' }}>
            <td colSpan="2" style={{ border: '2px solid black' }}>
              <h1>Logement Non Meublé</h1>
            </td>
          </tr>
          <tr style={{ height: '200px' }}>
            <td style={{ border: '2px solid black', width: '50%' }}>
              <div>Loyer Brut Annuel : {loyer} euros</div>
              <div>Taux d'Imposition : 
                <select value={tauxImpot} onChange={handleTauxChange}>
                  <option value="0">0%</option>
                  <option value="11">11%</option>
                  <option value="30">30%</option>
                  <option value="41">41%</option>
                  <option value="45">45%</option>
                </select>
              </div>
              <div>Impôt à payer : {impot1} euros</div>
            </td>
            <td style={{ border: '2px solid black', width: '50%' }}>
            <div>Loyer Brut Annuel : {loyer} euros</div>
              <div>Taux d'Imposition : 
                <select value={tauxImpot} onChange={handleTauxChange}>
                  <option value="0">0%</option>
                  <option value="11">11%</option>
                  <option value="30">30%</option>
                  <option value="41">41%</option>
                  <option value="45">45%</option>
                </select>
              </div>
              <div>Impôt à payer : {impot2} euros</div>
              <div>
                <input type="text" id="table1-motif" placeholder="Motif" />
                <input type="number" id="table1-tarif" placeholder="Tarif" />
                <button onClick={() => addRow(setRows1, setTotal, 'table1-motif', 'table1-tarif')}>Ajouter</button>
              </div>
              <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', border: '1px solid black' }}>
                <thead>
                  <tr>
                    <th>Motif</th>
                    <th>Tarif (Euros)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows1.map((row, index) => (
                    <tr key={index}>
                      <td>{row.motif}</td>
                      <td>{row.tarif.toFixed(2)} euros</td>
                      <td><button onClick={() => removeRow(index, setRows1, setTotal, rows1)}>Supprimer</button></td>
                    </tr>
                  ))}
                  <tr>
                    <td><strong>Total</strong></td>
                    <td><strong>{total.toFixed(2)} euros</strong></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr style={{ height: '100px' }}>
            <td colSpan="2" style={{ border: '2px solid black' }}>
            <h1>Logement Meublé</h1>
            </td>
          </tr>
          <tr style={{ height: '200px' }}>
            <td style={{ border: '2px solid black', width: '50%' }}>
            <div>Loyer Brut Annuel : {loyerMeuble} euros</div>
              <div>Taux d'Imposition : 
                <select value={tauxImpot} onChange={handleTauxChange}>
                  <option value="0">0%</option>
                  <option value="11">11%</option>
                  <option value="30">30%</option>
                  <option value="41">41%</option>
                  <option value="45">45%</option>
                </select>
              </div>
              <div>Impôt à payer : {impot3} euros</div>
            </td>
            <td style={{ border: '2px solid black', width: '50%' }}>
            <div>Loyer Brut Annuel : {loyerMeuble} euros</div>
            <div>Taux d'Imposition : 
                <select value={tauxImpot} onChange={handleTauxChange}>
                  <option value="0">0%</option>
                  <option value="11">11%</option>
                  <option value="30">30%</option>
                  <option value="41">41%</option>
                  <option value="45">45%</option>
                </select>
              </div>
              <div>
                <input type="text" id="table2-motif" placeholder="Description" />
                <input type="number" id="table2-tarif" placeholder="Montant" />
                <button onClick={() => addRow(setRows2, setSecondTotal, 'table2-motif', 'table2-tarif')}>Ajouter</button>
              </div>
              <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', border: '1px solid black' }}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Montant (Euros)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows2.map((row, index) => (
                    <tr key={index}>
                      <td>{row.motif}</td>
                      <td>{row.tarif.toFixed(2)} euros</td>
                      <td><button onClick={() => removeRow(index, setRows2, setSecondTotal, rows2)}>Supprimer</button></td>
                    </tr>
                  ))}
                  <tr>
                    <td><strong>Total</strong></td>
                    <td><strong>{secondTotal.toFixed(2)} euros</strong></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              <div>Impôt à payer : {impot4} euros</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TableauReact;
