/**
 * Debt Simplification & Resolution Optimization Matrix Engine
 * Computes minimum net payment structures across group membership vectors.
 */
export const calculateOptimalSettlements = (members, expenses, settlements) => {
  const netBalances = {};

  // Initialize ledger points for all known members
  members.forEach(m => {
    netBalances[m.userId] = 0;
  });

  // Calculate total paid vs total owed per participant
  expenses.forEach(exp => {
    const payer = exp.payerId;
    netBalances[payer] = (netBalances[payer] || 0) + exp.amountCents;

    exp.splits.forEach(split => {
      netBalances[split.userId] = (netBalances[split.userId] || 0) - split.amountCents;
    });
  });

  // Factor in verified structural settlements already processed
  settlements.forEach(set => {
    if (set.verified) {
      netBalances[set.payerId] = (netBalances[set.payerId] || 0) + set.amountCents;
      netBalances[set.receiverId] = (netBalances[set.receiverId] || 0) - set.amountCents;
    }
  });

  // Segregate positions into debtors and creditors
  const debtors = [];
  const creditors = [];

  Object.keys(netBalances).forEach(userId => {
    const balance = netBalances[userId];
    // Filter out minor floating point anomalies near sub-cent ranges
    if (Math.abs(balance) > 0) {
      if (balance < 0) {
        debtors.push({ userId, amount: Math.abs(balance) });
      } else {
        creditors.push({ userId, amount: balance });
      }
    }
  });

  const recommendations = [];

  // Two-pointer optimization logic loop
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settlementAmount = Math.min(debtor.amount, creditor.amount);

    recommendations.push({
      from: debtor.userId,
      to: creditor.userId,
      amountCents: settlementAmount
    });

    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;

    if (debtor.amount === 0) dIdx++;
    if (creditor.amount === 0) cIdx++;
  }

  return recommendations;
};