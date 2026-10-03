#!/usr/bin/env python3
"""Recalculate v2 expected monthly finances without importing economics_v2.py."""
import csv
import json
import math
from pathlib import Path
BASE = Path(__file__).resolve().parent
p = json.loads((BASE / 'inputs_v2.json').read_text())
monthly = list(csv.DictReader((BASE / 'monthly_v2.csv').open()))
aggregates = list(csv.DictReader((BASE / 'scenarios_v2.csv').open()))
sensitivities = list(csv.DictReader((BASE / 'sensitivity_v2.csv').open()))
checks = 0
errors = []

def check(key, value, expected, tol=.0003):
    global checks
    checks += 1
    if abs(float(value)-expected)>tol:
        errors.append(dict(field=key, actual=float(value), expected=expected))

def interpolate(points, month):
    if month <= points[0][0]: return float(points[0][1])
    if month >= points[-1][0]: return float(points[-1][1])
    j = next(i for i,q in enumerate(points) if q[0] >= month)
    (a,x),(b,y) = points[j-1:j+1]
    return x + (month-a)*(y-x)/(b-a)

def own_run(offer, scenario, changes=None):
    g = {k:x['value'] for k,x in p['general'].items()}
    d = {k:x['value'] for k,x in p['offers'][offer].items() if isinstance(x,dict)}
    s = {k:x['value'] for k,x in p['scenarios'][scenario].items()}
    for key,val in (changes or {}).items():
        target = g if key in g else d if key in d else s
        target[key] = val
    fixed = g['fixed_compliance_eur_month'] + g['fixed_infrastructure_eur_month'] + g['fixed_admin_eur_month']
    alive = installed = partners = previous_revenue = 0
    cumcash = cumcash30 = cumproject = draw = -d['startup_cash_eur']
    peak = peak30 = peakdraw = d['startup_cash_eur']
    rows=[]
    summaries=[]
    for month in range(1,25):
        new = interpolate(s['new_installed_customers_points'],month)*s.get('demand_multiplier',1)
        attach = 1 if offer=='F' else g['maintenance_attach']
        retained = alive*(1-s['monthly_logo_churn'])
        alive = retained + new*attach
        warranty = 0 if offer=='F' else new*(1-attach)
        serviced = alive + warranty
        installed += new
        needed_partners = math.ceil(installed / g['installed_customers_per_partner'] - 1e-12) if offer=='H' and installed else 0
        newpartners = max(0,needed_partners - partners)
        partners = needed_partners
        grosssetup = new*d['setup_price_net_eur']
        grossmonth = alive*d['monthly_price_net_eur']
        discount = s['discount']*(grosssetup + grossmonth)
        refund = s['refund_rate']*(grosssetup+grossmonth-discount)
        setuprev = grosssetup*(1-s['discount'])*(1-s['refund_rate'])
        monthrev = grossmonth*(1-s['discount'])*(1-s['refund_rate'])
        revenue = setuprev+monthrev
        share = revenue*g['partner_revenue_share'] if offer=='H' else 0
        payment = (grosssetup+grossmonth-discount)*(1+g['vat_hypothesis'])*g['stripe_percent']+(new+alive)*g['stripe_fixed_eur']
        tools = serviced*g['tool_cost_serviced_customer_month']
        entries = serviced*g['entries_customer_month']
        exceptions = entries*g['exception_rate']
        exceptionh = exceptions*g['minutes_per_exception']/60
        supporth = alive*g['support_hours_active_customer_month']+warranty*g['warranty_support_hours_new_customer']
        installh = new*d['delivery_hours_new_customer']
        salesh = new*d['sales_hours_new_customer']
        enableh = newpartners*g['partner_enable_hours']
        partnersalesh = newpartners*g['partner_sales_hours']
        partnersupporth = partners*g['partner_support_hours_month']
        deliveryh = exceptionh+supporth+installh+enableh+partnersupporth
        acquisitionh = salesh+partnersalesh
        startuptotalh = d['startup_founder_hours']/g['setup_spread_months'] if month<=g['setup_spread_months'] else 0
        startupfounderh = min(startuptotalh,max(0,g['founder_cap_hours_month']-g['management_hours_month']))
        startupcontracth = startuptotalh-startupfounderh
        capacity = max(0,g['founder_cap_hours_month']-g['management_hours_month']-startupfounderh)
        founder_variableh = min(capacity,deliveryh+acquisitionh)
        ratio = founder_variableh/(deliveryh+acquisitionh) if deliveryh+acquisitionh else 1
        founder_deliveryh = deliveryh*ratio
        founder_acqh = acquisitionh*ratio
        contract_deliveryh = deliveryh-founder_deliveryh
        contract_acqh = acquisitionh-founder_acqh
        contractorcash = (contract_deliveryh+contract_acqh)*g['contractor_hour_eur']
        startupcontractcash = startupcontracth*g['contractor_hour_eur']
        customercac = new*d['customer_cash_cac_eur']
        partnercac = newpartners*g['partner_acquisition_cash_eur']
        cashbefore = revenue-share-payment-tools-contract_deliveryh*g['contractor_hour_eur']
        econbefore = cashbefore-founder_deliveryh*g['founder_hour_eur']
        cashafter = cashbefore-customercac-partnercac-contract_acqh*g['contractor_hour_eur']
        econafter = cashafter-(founder_acqh+founder_deliveryh)*g['founder_hour_eur']
        opcash = cashafter-fixed
        founder_oph = g['management_hours_month']+founder_variableh
        founderh = founder_oph+startupfounderh
        founder_opcost = founder_oph*g['founder_hour_eur']
        opecon = opcash-founder_opcost
        startupcost = startupfounderh*g['founder_hour_eur']+startupcontractcash
        cumcash += opcash-startupcontractcash
        cashflow30 = opcash-revenue+previous_revenue-startupcontractcash
        cumcash30 += cashflow30
        cumproject += opecon-startupcost
        draw += opcash-startupcontractcash-founderh*g['founder_hour_eur']
        peak=max(peak,-cumcash);peak30=max(peak30,-cumcash30);peakdraw=max(peakdraw,-draw)
        row=dict(new_installed_customers=new,cumulative_installed_customers=installed,retained_subscription_customers=retained,new_subscribers=new*attach,active_subscribers=alive,subscriber_months=alive,serviced_customer_months=serviced,first_month_nonmaintenance_warranty_customers=warranty,new_partners=newpartners,active_enabled_partners=partners,candidate_entries_supported=entries,exception_entries=exceptions,exception_hours=exceptionh,customer_support_hours=supporth,installation_hours=installh,sales_hours=salesh,partner_enable_hours=enableh,partner_sales_hours=partnersalesh,partner_support_hours=partnersupporth,gross_setup_revenue_net_vat=grosssetup,gross_monthly_revenue_net_vat=grossmonth,discounts=discount,refunds=refund,setup_revenue_net=setuprev,monthly_revenue_net=monthrev,revenue_net=revenue,partner_revenue_share=share,payment_cost=payment,tool_cost=tools,customer_cac_cash=customercac,partner_cac_cash=partnercac,contribution_cash_before_acquisition=cashbefore,contribution_economic_before_acquisition=econbefore,contribution_cash_after_acquisition=cashafter,contribution_economic_after_acquisition=econafter,fixed_cash=fixed,founder_delivery_hours=founder_deliveryh,founder_acquisition_hours=founder_acqh,founder_startup_hours=startupfounderh,founder_operating_hours=founder_oph,founder_total_hours=founderh,founder_operating_cost=founder_opcost,contractor_delivery_hours=contract_deliveryh,contractor_acquisition_hours=contract_acqh,contractor_startup_hours=startupcontracth,contractor_cash=contractorcash,contractor_startup_cash=startupcontractcash,operating_cash=opcash,operating_economic=opecon,startup_economic_cost_month=startupcost,cumulative_cash=cumcash,cashflow_30d=cashflow30,cumulative_cash_30d=cumcash30,cumulative_project_economic=cumproject)
        rows.append(row)
        previous_revenue=revenue
        if month in [12,24]:
            sm=lambda k:sum(r[k] for r in rows)
            startupcash=d['startup_cash_eur']+sm('contractor_startup_cash')
            reserve=max(g['minimum_reserve_eur'],fixed*g['reserve_months_fixed_cash'])
            drawreserve=max(g['minimum_reserve_eur'],g['reserve_months_fixed_cash']*(fixed+founderh*g['founder_hour_eur']))
            summary=dict(installed_customers=installed,active_subscribers_exit=alive,subscriber_months=sm('subscriber_months'),serviced_customer_months=sm('serviced_customer_months'),enabled_partners_exit=partners,partner_enable_hours=sm('partner_enable_hours'),partner_sales_hours=sm('partner_sales_hours'),partner_support_hours=sm('partner_support_hours'),partner_cash_cac=sm('partner_cac_cash'),candidate_entries_supported=sm('candidate_entries_supported'),exception_hours=sm('exception_hours'),setup_revenue_net=sm('setup_revenue_net'),monthly_revenue_net=sm('monthly_revenue_net'),revenue_net=sm('revenue_net'),partner_revenue_share=sm('partner_revenue_share'),payment_cost=sm('payment_cost'),tool_cost=sm('tool_cost'),customer_cash_cac=sm('customer_cac_cash'),contribution_cash_before_acquisition=sm('contribution_cash_before_acquisition'),contribution_economic_before_acquisition=sm('contribution_economic_before_acquisition'),contribution_cash_after_acquisition=sm('contribution_cash_after_acquisition'),contribution_economic_after_acquisition=sm('contribution_economic_after_acquisition'),fixed_cash=sm('fixed_cash'),operating_cash=sm('operating_cash'),operating_economic=sm('operating_economic'),startup_cash=startupcash,startup_founder_hours=sm('founder_startup_hours'),project_economic=cumproject,cash_after_startup=cumcash,max_cash_deficit=peak,cash_reserve=reserve,cash_requirement_with_reserve=peak+reserve,cash_requirement_30d_with_reserve=peak30+reserve,cash_requirement_founder_draws=peakdraw+drawreserve,founder_hours_including_startup=sm('founder_total_hours'),contractor_hours=sm('contractor_delivery_hours')+sm('contractor_acquisition_hours')+sm('contractor_startup_hours'),contractor_cash=sm('contractor_cash')+sm('contractor_startup_cash'),founder_earnings_per_hour=cumcash/sm('founder_total_hours'),operating_economic_exit_month=opecon,setup_revenue_exit_month=setuprev,monthly_revenue_exit_month=monthrev,founder_hours_exit_month=founderh,new_installed_customers_exit_month=new)
            summaries.append({'horizon_months':month}|summary)
    return rows,summaries

central=[]
for offer in p['offers']:
    for scenario in p['scenarios']:
        expectedrows,expectedsums=own_run(offer,scenario)
        actualrows=[r for r in monthly if r['offer']==offer and r['scenario']==scenario]
        for row,actual in zip(expectedrows,actualrows):
            for key,val in row.items():check(f'{offer}/{scenario}/{actual["month"]}/{key}',actual[key],val)
        for a in expectedsums:
            actual=next(r for r in aggregates if r['offer']==offer and r['scenario']==scenario and int(r['horizon_months'])==a['horizon_months'])
            for key,val in a.items():check(f'{offer}/{scenario}/{a["horizon_months"]}/sum/{key}',actual[key],val)
            if scenario=='centrale':central.append({'offer':offer}|a)

mapping={'centrale':{},'zero clienti':{'demand_multiplier':0},'installazioni -50%':{'demand_multiplier':.5},'installazioni +50%':{'demand_multiplier':1.5},'setup249':{'setup_price_net_eur':249},'setup490':{'setup_price_net_eur':490},'setup790':{'setup_price_net_eur':790},'mensile79':{'monthly_price_net_eur':79},'commerciale6h/cliente':{'sales_hours_new_customer':6},'installazione8h/cliente':{'delivery_hours_new_customer':8},'CACcash80/cliente':{'customer_cash_cac_eur':80},'rimborsi10%':{'refund_rate':.1},'eccezioni25%':{'exception_rate':.25},'gestione40h/mese':{'management_hours_month':40},'mantenimento30%':{'maintenance_attach':.3},'mantenimento0%':{'maintenance_attach':0},'quota partner15%':{'partner_revenue_share':.15},'quota partner40%':{'partner_revenue_share':.4},'produttività partner2clienti':{'installed_customers_per_partner':2},'setup790 + installazioni -30%':{'setup_price_net_eur':790,'demand_multiplier':.7},'setup790 e installazioni -30%':{'setup_price_net_eur':790,'demand_multiplier':.7},'setup790, installazioni -30%, mantenimento0%':{'setup_price_net_eur':790,'demand_multiplier':.7,'maintenance_attach':0},'commerciale6h e CACcash100':{'sales_hours_new_customer':6,'customer_cash_cac_eur':100}}
selected=[]
skipped=[]
for actual in sensitivities:
    label=actual['case'];offer=actual['offer']
    if label=='avvio cash+5000': changes={'startup_cash_eur':p['offers'][offer]['startup_cash_eur']['value']+5000}
    elif label in mapping:changes=mapping[label]
    else:skipped.append(label);continue
    a=own_run(offer,'centrale',changes)[1][-1]
    fields={'revenue_net_24':'revenue_net','operating_economic_24':'operating_economic','project_economic_24':'project_economic','cash_requirement':'cash_requirement_with_reserve','cash_requirement_founder_draws':'cash_requirement_founder_draws','founder_earnings_per_hour':'founder_earnings_per_hour','operating_economic_exit_month':'operating_economic_exit_month','contractor_hours':'contractor_hours'}
    for key,source in fields.items():check(f'{offer}/sensitivity/{label}/{key}',actual[key],a[source])
    if offer=='G' and label in ['setup790','installazioni -50%','gestione40h/mese','mantenimento0%','eccezioni25%','setup790 + installazioni -30%','setup790 e installazioni -30%','setup790, installazioni -30%, mantenimento0%','commerciale6h e CACcash100']:
        selected.append({'case':label}|{key:a[source] for key,source in fields.items()})
result={'passed':not errors,'comparisons':checks,'errors':errors,'unmapped_sensitivity_labels':skipped,'central':central,'selected_G_sensitivities':selected,'semantics':'Setup recognised in installation-delivery month; maintenance monthly earned; no annual prepayment modelled. G/H warranty customers counted once; partner enablement paid only when cumulative installations require a new partner.'}
(BASE/'independent_audit_v2.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'passed':result['passed'],'comparisons':checks,'errors':errors,'unmapped_sensitivity_labels':skipped,'central_compact':[{k:r[k] for k in ['offer','horizon_months','revenue_net','operating_economic','project_economic','cash_requirement_with_reserve','cash_requirement_founder_draws','founder_hours_including_startup','founder_earnings_per_hour','operating_economic_exit_month','enabled_partners_exit']} for r in central],'selected_G_sensitivities':selected},indent=2))
if errors:raise SystemExit(1)
