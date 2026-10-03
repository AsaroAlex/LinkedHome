#!/usr/bin/env python3
"""Independent arithmetic/cohort audit. Does not import economics.py."""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
p = json.loads((ROOT / 'parameters.json').read_text())
g = {k: v['value'] for k, v in p['general'].items()}
scenarios = list(csv.DictReader((ROOT / 'scenarios.csv').open()))
monthly = list(csv.DictReader((ROOT / 'monthly.csv').open()))
thresholds = list(csv.DictReader((ROOT / 'break_even.csv').open()))
errors = []
checks = 0

def near(label, actual, expected, tolerance=0.0002):
    global checks
    checks += 1
    if abs(float(actual) - expected) > tolerance:
        errors.append({'field': label, 'actual': float(actual), 'expected': expected})

def interp(points, month):
    if month <= points[0][0]:
        return float(points[0][1])
    if month >= points[-1][0]:
        return float(points[-1][1])
    right = next(i for i, v in enumerate(points) if v[0] >= month)
    l, r = points[right - 1], points[right]
    return l[1] + (month - l[0]) / (r[0] - l[0]) * (r[1] - l[1])

results = []
for model, rawmd in p['models'].items():
    md = {k: v['value'] for k, v in rawmd.items()}
    fixed = sum(md[k] for k in ['fixed_tools_infrastructure_eur_month', 'fixed_legal_compliance_eur_month', 'fixed_admin_eur_month'])
    for scenario, raws in p['scenarios'].items():
        s = {k: v['value'] for k, v in raws.items()}
        previous_active = 0
        cash = cash30 = paidfounder = -md['setup_cash_eur']
        cash_min = cash30_min = paidfounder_min = cash
        previous_revenue = 0
        own = []
        for month in range(1, 25):
            new = interp(s['monthly_new_paying_clients_points'][model], month)
            retained = previous_active * (1 - s['logo_churn_month'][model])
            active = retained + new
            practices = active * s['practice_frequency_month'][model] if model == 'E' else new + retained * s['practice_frequency_month'][model]
            gross = md['price_practice_net_eur'] * practices + md['price_subscription_net_eur'] * active
            charged = gross * (1 - s['discount_rate'])
            revenue = charged * (1 - s['refund_rate'])
            candidates = practices * md['candidates_per_practice']
            requests = practices * s['checks_per_practice'][model]
            free = requests * s['free_checks_ratio']
            retry = (requests + free) * s['retry_attempts_ratio']
            attempts = requests + free + retry
            provider = max(attempts * ((1 - s['provider_failed_attempt_rate']) * s['provider_success_cost_eur'] + s['provider_failed_attempt_rate'] * s['provider_failed_cost_eur']), s['provider_minimum_eur_month'])
            transactions = practices + (active if md['price_subscription_net_eur'] else 0)
            fees = charged * (1 + g['vat_rate_hypothesis']) * g['payment_percent'] + transactions * g['payment_fixed_eur']
            disputes = practices * s['dispute_rate'] * s['dispute_external_cost_eur']
            sales_h = new * s['paying_client_acquisition_hours'][model]
            delivery_h = new * s['payer_activation_hours'][model] + candidates * s['renter_activation_hours_each'] + practices * (s['manual_review_hours_practice'][model] + s['support_hours_practice'][model] + s['dispute_rate'] * s['dispute_hours_each']) + active * s['operator_support_hours_month'][model]
            setup_h = md['setup_founder_hours'] / g['setup_spread_months'] if month <= g['setup_spread_months'] else 0
            founder_setup_h = min(setup_h, max(0, g['founder_hours_month_cap'] - g['management_hours_month']))
            setup_contractor_cash = (setup_h - founder_setup_h) * g['contractor_hour_cost_eur']
            capacity = max(0, g['founder_hours_month_cap'] - g['management_hours_month'] - founder_setup_h)
            founder_variable_h = min(sales_h + delivery_h, capacity)
            contractor_h = sales_h + delivery_h - founder_variable_h
            fraction = founder_variable_h / (sales_h + delivery_h) if sales_h + delivery_h else 1
            founder_h = g['management_hours_month'] + founder_variable_h + founder_setup_h
            founder_operating_cost = (g['management_hours_month'] + founder_variable_h) * g['founder_hour_value_eur']
            acquisition_cash = new * s['paying_client_cash_cac_eur'][model]
            op_cash = revenue - provider - fees - disputes - acquisition_cash - candidates * g['renter_cash_cac_eur'] - contractor_h * g['contractor_hour_cost_eur'] - fixed
            op_econ = op_cash - founder_operating_cost
            cm_before = revenue - provider - fees - disputes - candidates * g['renter_cash_cac_eur'] - delivery_h * fraction * g['founder_hour_value_eur'] - delivery_h * (1 - fraction) * g['contractor_hour_cost_eur']
            cm_after = cm_before - acquisition_cash - sales_h * fraction * g['founder_hour_value_eur'] - sales_h * (1 - fraction) * g['contractor_hour_cost_eur']
            cash += op_cash - setup_contractor_cash
            cash30 += op_cash - revenue + previous_revenue - setup_contractor_cash
            paidfounder += op_cash - founder_operating_cost - founder_setup_h * g['founder_hour_value_eur'] - setup_contractor_cash
            cash_min, cash30_min, paidfounder_min = min(cash_min, cash), min(cash30_min, cash30), min(paidfounder_min, paidfounder)
            expected = dict(new_paying_clients=new, retained_paying_clients=retained, active_paying_clients=active, practices=practices, candidates_activated=candidates, checks_requested=requests, checks_free=free, checks_retry=retry, provider_attempts=attempts, provider_cost=provider, payment_cost=fees, revenue_net=revenue, operating_cash=op_cash, operating_economic=op_econ, founder_hours=founder_h, founder_economic_cost=founder_operating_cost, contribution_economic_before_acquisition=cm_before, contribution_economic_after_acquisition=cm_after, cumulative_cash=cash, cumulative_cash_30d=cash30)
            actual = next(r for r in monthly if r['model'] == model and r['scenario'] == scenario and int(r['month']) == month)
            for k, v in expected.items():
                near(f'{model}/{scenario}/{month}/{k}', actual[k], v)
            own.append(expected | {'setup_h': founder_setup_h, 'contractor_h': contractor_h, 'setup_contractor_cash': setup_contractor_cash})
            previous_revenue, previous_active = revenue, active
            if month in [12, 24]:
                totals = {k: sum(r[k] for r in own) for k in ['new_paying_clients', 'practices', 'revenue_net', 'operating_cash', 'operating_economic', 'founder_hours', 'setup_h', 'setup_contractor_cash', 'contractor_h']}
                setupcash = md['setup_cash_eur'] + totals['setup_contractor_cash']
                project = totals['operating_economic'] - setupcash - totals['setup_h'] * g['founder_hour_value_eur']
                reserve = max(g['minimum_reserve_eur'], g['reserve_months_fixed_cash'] * fixed)
                reservesalary = max(g['minimum_reserve_eur'], g['reserve_months_fixed_cash'] * (fixed + founder_h * g['founder_hour_value_eur']))
                aggregate = dict(new_paying_clients=totals['new_paying_clients'], active_paying_clients_exit=active, practices=totals['practices'], revenue_net=totals['revenue_net'], operating_cash=totals['operating_cash'], operating_economic=totals['operating_economic'], project_economic_after_setup=project, cumulative_cash_after_setup=cash, founder_hours_including_setup=totals['founder_hours'], contractor_hours=totals['contractor_h'], founder_economic_earnings_per_hour=cash / totals['founder_hours'], cash_requirement_with_reserve=max(0, setupcash, -cash_min) + reserve, cash_requirement_30d_with_reserve=max(0, setupcash, -cash30_min) + reserve, cash_requirement_with_founder_draws=max(0, -paidfounder_min) + reservesalary)
                actuala = next(r for r in scenarios if r['model'] == model and r['scenario'] == scenario and int(r['horizon_months']) == month)
                for k, v in aggregate.items():
                    near(f'{model}/{scenario}/{month}/aggregate/{k}', actuala[k], v)
                if model == 'D' and scenario == 'centrale':
                    results.append({'model': model, 'scenario': scenario, 'horizon': month} | aggregate)

# Direct stationary-cost evaluation at the published central D threshold.
md = {k: v['value'] for k, v in p['models']['D'].items()}
s = {k: v['value'] for k, v in p['scenarios']['centrale'].items()}
threshold = next(r for r in thresholds if r['model'] == 'D' and r['scenario'] == 'centrale')
x = float(threshold['break_even_active_clients'])
new = x * s['logo_churn_month']['D']
practices = new + (x - new) * s['practice_frequency_month']['D']
expected_rev = practices * md['price_practice_net_eur'] * (1 - s['discount_rate']) * (1 - s['refund_rate'])
providerunit = s['checks_per_practice']['D'] * (1 + s['free_checks_ratio']) * (1 + s['retry_attempts_ratio']) * ((1 - s['provider_failed_attempt_rate']) * s['provider_success_cost_eur'] + s['provider_failed_attempt_rate'] * s['provider_failed_cost_eur'])
feeunit = md['price_practice_net_eur'] * (1 - s['discount_rate']) * (1 + g['vat_rate_hypothesis']) * g['payment_percent'] + g['payment_fixed_eur']
deliveryunit_h = md['candidates_per_practice'] * s['renter_activation_hours_each'] + s['manual_review_hours_practice']['D'] + s['support_hours_practice']['D'] + s['dispute_rate'] * s['dispute_hours_each']
recurring_cm = md['price_practice_net_eur'] * (1 - s['discount_rate']) * (1 - s['refund_rate']) - providerunit - feeunit - s['dispute_rate'] * s['dispute_external_cost_eur'] - deliveryunit_h * g['founder_hour_value_eur']
new_cost = s['paying_client_cash_cac_eur']['D'] + (s['paying_client_acquisition_hours']['D'] + s['payer_activation_hours']['D']) * g['founder_hour_value_eur']
fixed = sum(md[k] for k in ['fixed_tools_infrastructure_eur_month', 'fixed_legal_compliance_eur_month', 'fixed_admin_eur_month'])
stationary_profit = practices * recurring_cm - new * new_cost - fixed - g['management_hours_month'] * g['founder_hour_value_eur']
near('Dcentral published break-even residual', stationary_profit, 0, 0.0001)
unit = {'revenue_net_per_practice': md['price_practice_net_eur'] * (1 - s['discount_rate']) * (1 - s['refund_rate']), 'provider_per_practice': providerunit, 'payment_per_practice': feeunit, 'recurring_delivery_hours': deliveryunit_h, 'recurring_contribution_before_acquisition': recurring_cm, 'new_payer_acquisition_and_activation_economic': new_cost, 'first_practice_after_acquisition': recurring_cm - new_cost, 'first_three_practices_cumulative_before_fixed': 3 * recurring_cm - new_cost, 'payback_practices_ceiling': __import__('math').ceil(new_cost / recurring_cm), 'annual_logo_retention': (1 - s['logo_churn_month']['D']) ** 12, 'break_even_active_clients': x, 'break_even_stationary_residual': stationary_profit}
output = {'checks': checks, 'errors': errors, 'passed': not errors, 'central_D_unit': unit, 'central_D_horizons': results}
(ROOT / 'independent_audit.json').write_text(json.dumps(output, indent=2) + '\n')
print(json.dumps(output, indent=2))
if errors:
    raise SystemExit(1)
