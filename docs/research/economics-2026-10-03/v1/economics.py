#!/usr/bin/env python3
"""Soglia: deterministic, expected-value monthly cohorts; standard library only.
Run: python economics.py [--parameters parameters.json] [--output-dir .]
Numbers represent assumptions, not forecasts or validated willingness to pay.
"""
import argparse, copy, csv, json, math
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def value(block, name):
    return block[name]['value']

def ramp_at(points, month):
    if month <= points[0][0]: return float(points[0][1])
    for (a, x), (b, y) in zip(points, points[1:]):
        if month <= b: return x + (y-x)*(month-a)/(b-a)
    return float(points[-1][1])

def run(p, model, scenario, overrides=None):
    s, md, g = p['scenarios'][scenario], p['models'][model], p['general']
    z = {k: d['value'] for k, d in s.items()}
    if overrides: z.update(overrides)
    price = value(md, 'price_practice_net_eur') * z.get('price_multiplier', 1.0)
    subscription = value(md, 'price_subscription_net_eur') * z.get('price_multiplier', 1.0)
    management_h = z.get('management_hours_month', value(g, 'management_hours_month'))
    setup_months = value(g, 'setup_spread_months')
    wage, cap = value(g, 'founder_hour_value_eur'), value(g, 'founder_hours_month_cap')
    contractor_wage = value(g, 'contractor_hour_cost_eur')
    fixed_cash = sum(value(md, k) for k in ['fixed_tools_infrastructure_eur_month', 'fixed_legal_compliance_eur_month', 'fixed_admin_eur_month'])
    cohorts, rows, cum_cash = [], [], -value(md, 'setup_cash_eur')
    cum_cash_30d = cum_cash
    cum_economic_project = cum_cash
    previous_revenue = 0.0
    for month in range(1,25):
        new = ramp_at(z['monthly_new_paying_clients_points'][model], month) * z.get('demand_multiplier', 1.0)
        retained = sum(n*(1-z['logo_churn_month'][model])**(month-created) for created, n in cohorts)
        active = retained+new
        freq = z['practice_frequency_month'][model]
        practices = active*freq if model == 'E' else new+retained*freq
        recurring_practices = retained*freq  # older cohorts only, also for subscription E
        cohorts.append((month, new))
        gross_net_vat = price*practices+subscription*active
        discounts = gross_net_vat*z['discount_rate']
        refunds = (gross_net_vat-discounts)*z['refund_rate']
        revenue = gross_net_vat-discounts-refunds
        candidates = practices*value(md,'candidates_per_practice')
        check_requested = practices*z['checks_per_practice'][model]
        checks_free = check_requested*z['free_checks_ratio']
        checks_retry = (check_requested+checks_free)*z['retry_attempts_ratio']
        attempts = check_requested+checks_free+checks_retry
        fail = attempts*z['provider_failed_attempt_rate']
        success = attempts-fail
        provider_cost = success*z['provider_success_cost_eur']+fail*z['provider_failed_cost_eur']
        provider_minimum = z.get('provider_minimum_eur_month',0.0)
        provider_cost = max(provider_cost,provider_minimum)
        # Fee applies to VAT-inclusive amount actually charged before refunds.
        # Monthly subscription billed separately from each practice.
        transactions = practices+(active if subscription else 0)
        charged_gross_vat = (gross_net_vat-discounts)*(1+value(g,'vat_rate_hypothesis'))
        payment_cost = charged_gross_vat*value(g,'payment_percent')+transactions*value(g,'payment_fixed_eur')
        dispute_cost = practices*z['dispute_rate']*z['dispute_external_cost_eur']
        acquisition_cash = new*z['paying_client_cash_cac_eur'][model]
        renter_acquisition_cash = candidates*value(g,'renter_cash_cac_eur')
        payer_activation_h = new*z['payer_activation_hours'][model]
        renter_activation_h = candidates*z['renter_activation_hours_each']
        review_h = practices*z['manual_review_hours_practice'][model]
        support_h = practices*z['support_hours_practice'][model]+active*z['operator_support_hours_month'][model]
        dispute_h = practices*z['dispute_rate']*z['dispute_hours_each']
        acquisition_h = new*z['paying_client_acquisition_hours'][model]
        delivery_h = payer_activation_h+renter_activation_h+review_h+support_h+dispute_h
        variable_h = acquisition_h+delivery_h
        setup_requested_h = value(md,'setup_founder_hours')/setup_months if month<=setup_months else 0.0
        founder_setup_h = min(setup_requested_h,max(cap-management_h,0))
        contractor_setup_h = max(setup_requested_h-founder_setup_h,0)
        contractor_setup_cash = contractor_setup_h*contractor_wage
        founder_capacity = max(cap-management_h-founder_setup_h,0)
        founder_fraction = min(1,founder_capacity/variable_h) if variable_h else 1
        founder_delivery_h, founder_acquisition_h = delivery_h*founder_fraction, acquisition_h*founder_fraction
        contractor_delivery_h, contractor_acquisition_h = delivery_h*(1-founder_fraction), acquisition_h*(1-founder_fraction)
        contractor_delivery_cash, contractor_acquisition_cash = contractor_delivery_h*contractor_wage, contractor_acquisition_h*contractor_wage
        external_delivery = provider_cost+payment_cost+dispute_cost+renter_acquisition_cash+contractor_delivery_cash
        contribution_cash_before_cac = revenue-external_delivery
        contribution_economic_before_cac = contribution_cash_before_cac-founder_delivery_h*wage
        contribution_cash_after_cac = contribution_cash_before_cac-acquisition_cash-contractor_acquisition_cash
        contribution_economic_after_cac = contribution_economic_before_cac-acquisition_cash-contractor_acquisition_cash-founder_acquisition_h*wage
        operating_cash = contribution_cash_after_cac-fixed_cash
        founder_operating_hours = management_h+founder_delivery_h+founder_acquisition_h
        founder_hours = founder_operating_hours+founder_setup_h
        founder_economic_cost = founder_operating_hours*wage
        setup_economic_cost_month = founder_setup_h*wage+contractor_setup_cash
        operating_economic = operating_cash-founder_economic_cost
        cash_receipts_30d = previous_revenue
        cashflow_30d = operating_cash-revenue+cash_receipts_30d-contractor_setup_cash
        previous_revenue = revenue
        cum_cash += operating_cash-contractor_setup_cash
        cum_cash_30d += cashflow_30d
        cum_economic_project += operating_economic-setup_economic_cost_month
        rows.append(dict(model=model,scenario=scenario,month=month,new_paying_clients=new,retained_paying_clients=retained,active_paying_clients=active,client_months=active,practices=practices,recurring_practices=recurring_practices,practices_per_active_client=practices/active if active else 0,candidates_activated=candidates,checks_requested=check_requested,checks_free=checks_free,checks_retry=checks_retry,provider_attempts=attempts,provider_successes=success,provider_failures=fail,gross_revenue_net_vat=gross_net_vat,discounts=discounts,refunds=refunds,revenue_net=revenue,provider_cost=provider_cost,payment_cost=payment_cost,dispute_external_cost=dispute_cost,paying_client_acquisition_cash=acquisition_cash,renter_acquisition_cash=renter_acquisition_cash,payer_activation_hours=payer_activation_h,renter_activation_hours=renter_activation_h,manual_review_hours=review_h,support_hours=support_h,dispute_hours=dispute_h,acquisition_hours=acquisition_h,variable_hours_demand=variable_h,founder_delivery_hours=founder_delivery_h,founder_acquisition_hours=founder_acquisition_h,contractor_delivery_hours=contractor_delivery_h,contractor_acquisition_hours=contractor_acquisition_h,contractor_cash=contractor_delivery_cash+contractor_acquisition_cash,contribution_cash_before_acquisition=contribution_cash_before_cac,contribution_economic_before_acquisition=contribution_economic_before_cac,contribution_cash_after_acquisition=contribution_cash_after_cac,contribution_economic_after_acquisition=contribution_economic_after_cac,fixed_cash_cost=fixed_cash,founder_operating_hours=founder_operating_hours,founder_setup_hours=founder_setup_h,contractor_setup_hours=contractor_setup_h,contractor_setup_cash=contractor_setup_cash,setup_economic_cost_month=setup_economic_cost_month,founder_hours=founder_hours,founder_economic_cost=founder_economic_cost,operating_cash=operating_cash,operating_economic=operating_economic,cash_receipts_30d=cash_receipts_30d,cashflow_30d=cashflow_30d,cumulative_cash=cum_cash,cumulative_cash_30d=cum_cash_30d,cumulative_economic_project=cum_economic_project))
    return rows

def aggregate(p, rows, horizon):
    rs = rows[:horizon]
    model, scenario = rs[0]['model'],rs[0]['scenario']
    md, g = p['models'][model],p['general']
    sums = lambda key: sum(r[key] for r in rs)
    setup_cash, setup_hours = value(md,'setup_cash_eur')+sums('contractor_setup_cash'),sums('founder_setup_hours')
    max_deficit = max(0,setup_cash,-min(r['cumulative_cash'] for r in rs))
    max_deficit_30d = max(0,setup_cash,-min(r['cumulative_cash_30d'] for r in rs))
    reserve = max(value(g,'minimum_reserve_eur'),value(g,'reserve_months_fixed_cash')*rs[-1]['fixed_cash_cost'])
    reserve_draws = max(value(g,'minimum_reserve_eur'),value(g,'reserve_months_fixed_cash')*(rs[-1]['fixed_cash_cost']+rs[-1]['founder_hours']*value(g,'founder_hour_value_eur')))
    cumdraw=-value(md,'setup_cash_eur')
    deficitdraw=max(0,-cumdraw)
    for r in rs:
        cumdraw+=r['operating_cash']-r['founder_economic_cost']-r['founder_setup_hours']*value(g,'founder_hour_value_eur')-r['contractor_setup_cash']
        deficitdraw=max(deficitdraw,-cumdraw)
    foundertime=sums('founder_hours')
    cumulative_earnings=sums('operating_cash')-setup_cash
    economic_ops=sums('operating_economic')
    latest=rs[-1]
    return dict(model=model,scenario=scenario,horizon_months=horizon,new_paying_clients=sums('new_paying_clients'),active_paying_clients_exit=latest['active_paying_clients'],client_months=sums('client_months'),practices=sums('practices'),repeat_practices=sums('recurring_practices'),candidates_activated=sums('candidates_activated'),checks_requested=sums('checks_requested'),checks_free=sums('checks_free'),checks_retry=sums('checks_retry'),provider_attempts=sums('provider_attempts'),provider_cost=sums('provider_cost'),payment_cost=sums('payment_cost'),revenue_net=sums('revenue_net'),contribution_cash_before_acquisition=sums('contribution_cash_before_acquisition'),contribution_economic_before_acquisition=sums('contribution_economic_before_acquisition'),acquisition_cash=sums('paying_client_acquisition_cash'),renter_acquisition_cash=sums('renter_acquisition_cash'),contribution_cash_after_acquisition=sums('contribution_cash_after_acquisition'),contribution_economic_after_acquisition=sums('contribution_economic_after_acquisition'),fixed_cash_cost=sums('fixed_cash_cost'),operating_cash=sums('operating_cash'),operating_economic=economic_ops,setup_cash=setup_cash,setup_founder_hours=setup_hours,project_economic_after_setup=economic_ops-setup_cash-setup_hours*value(g,'founder_hour_value_eur'),cumulative_cash_after_setup=cumulative_earnings,max_cash_deficit=max_deficit,cash_reserve=reserve,cash_requirement_with_reserve=max_deficit+reserve,max_cash_deficit_30d=max_deficit_30d,cash_requirement_30d_with_reserve=max_deficit_30d+reserve,cash_requirement_with_founder_draws=deficitdraw+reserve_draws,founder_hours_including_setup=foundertime,founder_setup_hours=setup_hours,contractor_setup_hours=sums('contractor_setup_hours'),contractor_hours=sums('contractor_delivery_hours')+sums('contractor_acquisition_hours'),contractor_cash=sums('contractor_cash'),founder_economic_earnings_per_hour=cumulative_earnings/foundertime if foundertime else 0,operating_economic_exit_month=latest['operating_economic'],operating_cash_exit_month=latest['operating_cash'],founder_hours_exit_month=latest['founder_hours'],practices_exit_month=latest['practices'],revenue_exit_month=latest['revenue_net'])

def steady(p,model,scenario,active):
    # Sustainable stationary cohort: replace each month's churn with acquisitions.
    s,g,md=p['scenarios'][scenario],p['general'],p['models'][model]
    z={k:v['value'] for k,v in s.items()}
    new=active*z['logo_churn_month'][model]
    frequency=z['practice_frequency_month'][model]
    practices=active*frequency if model=='E' else new+(active-new)*frequency
    price,sub=value(md,'price_practice_net_eur'),value(md,'price_subscription_net_eur')
    gross=price*practices+sub*active
    discounted=gross*(1-z['discount_rate'])
    revenue=discounted*(1-z['refund_rate'])
    checks=practices*z['checks_per_practice'][model]*(1+z['free_checks_ratio'])*(1+z['retry_attempts_ratio'])
    provider=max(checks*((1-z['provider_failed_attempt_rate'])*z['provider_success_cost_eur']+z['provider_failed_attempt_rate']*z['provider_failed_cost_eur']),z.get('provider_minimum_eur_month',0.0))
    payment=discounted*(1+value(g,'vat_rate_hypothesis'))*value(g,'payment_percent')+(practices+(active if sub else 0))*value(g,'payment_fixed_eur')
    disputes=practices*z['dispute_rate']*z['dispute_external_cost_eur']
    acquisition_cash=new*z['paying_client_cash_cac_eur'][model]
    hours=new*(z['paying_client_acquisition_hours'][model]+z['payer_activation_hours'][model])+practices*(value(md,'candidates_per_practice')*z['renter_activation_hours_each']+z['manual_review_hours_practice'][model]+z['support_hours_practice'][model]+z['dispute_rate']*z['dispute_hours_each'])+active*z['operator_support_hours_month'][model]
    management=value(g,'management_hours_month')
    founder_variable=min(hours,max(value(g,'founder_hours_month_cap')-management,0))
    contractor_hours=max(hours-founder_variable,0)
    fixed=sum(value(md,k) for k in ['fixed_tools_infrastructure_eur_month','fixed_legal_compliance_eur_month','fixed_admin_eur_month'])
    cash=revenue-provider-payment-disputes-acquisition_cash-contractor_hours*value(g,'contractor_hour_cost_eur')-fixed
    economic=cash-(management+founder_variable)*value(g,'founder_hour_value_eur')
    return dict(model=model,scenario=scenario,active_clients=active,new_replacement_clients_month=new,practices_month=practices,revenue_month=revenue,operating_economic_month=economic,operating_cash_month=cash,founder_hours_month=management+founder_variable,contractor_hours_month=contractor_hours)

def break_even(p,model,scenario):
    # Scan first: negative unit economics may make a threshold impossible.
    lo, hi=0.0,None
    for n in range(1,10001):
        if steady(p,model,scenario,float(n))['operating_economic_month']>=0:
            hi=float(n);lo=float(n-1);break
    if hi is None: return dict(model=model,scenario=scenario,break_even_active_clients=None,break_even_practices_month=None,break_even_practices_year=None,break_even_revenue_year=None,founder_hours_month=None,contractor_hours_month=None)
    for _ in range(50):
        mid=(lo+hi)/2
        if steady(p,model,scenario,mid)['operating_economic_month']>=0:hi=mid
        else:lo=mid
    x=steady(p,model,scenario,hi)
    return dict(model=model,scenario=scenario,break_even_active_clients=hi,break_even_practices_month=x['practices_month'],break_even_practices_year=x['practices_month']*12,break_even_revenue_year=x['revenue_month']*12,founder_hours_month=x['founder_hours_month'],contractor_hours_month=x['contractor_hours_month'])

def sensitivity(p):
    cases=[('centrale',{}),('prezzo D79 / B-E invariati',{'price_multiplier':79/99}),('prezzo D129 / B-E invariati',{'price_multiplier':129/99}),('domanda -50%',{'demand_multiplier':.5}),('domanda +50%',{'demand_multiplier':1.5}),('prezzo -20%',{'price_multiplier':.8}),('prezzo +20%',{'price_multiplier':1.2}),('provider 20 euro/successo',{'provider_success_cost_eur':20.0}),('minimo provider 250 euro/mese',{'provider_minimum_eur_month':250.0}),('minimo provider 500 euro/mese',{'provider_minimum_eur_month':500.0}),('minimo provider 1000 euro/mese',{'provider_minimum_eur_month':1000.0}),('gestione founder20h/mese',{'management_hours_month':20.0}),('setup cash +5000 euro',{'setup_cash_add_eur':5000.0}),('tempo manuale +50%',{'manual_review_hours_practice':{m:value(p['scenarios']['centrale'],'manual_review_hours_practice')[m]*1.5 for m in p['models']}}),('riacquisto/frequenza -50%',{'practice_frequency_month':{m:value(p['scenarios']['centrale'],'practice_frequency_month')[m]*.5 for m in p['models']}})]
    out=[]
    for m in p['models']:
        for label, overrides in cases:
            if label.startswith('prezzo D') and m!='D': continue
            run_p=copy.deepcopy(p)
            if 'setup_cash_add_eur' in overrides: run_p['models'][m]['setup_cash_eur']['value']+=overrides['setup_cash_add_eur']
            result=aggregate(run_p,run(run_p,m,'centrale',overrides),24)
            out.append(dict(model=m,case=label,operating_economic_24=result['operating_economic'],project_economic_24=result['project_economic_after_setup'],operating_economic_exit_month=result['operating_economic_exit_month'],cash_required=result['cash_requirement_with_reserve'],founder_earnings_hour=result['founder_economic_earnings_per_hour']))
    return out

def write_csv(path,rows):
    with path.open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader()
        for row in rows:w.writerow({k:round(v,6) if isinstance(v,float) else v for k,v in row.items()})

def eur(x): return f'{x:,.0f}'.replace(',','.')+' €'
def dec(x): return f'{x:.1f}'.replace('.',',')

def report(p,aggregates,thresholds,sens,out):
    lines=['# Economia di Soglia — ipotesi riproducibili, non previsione','',f'Data di riferimento: {p["as_of"]}. Valori netti IVA; il trattamento IVA al 22% è un’ipotesi fiscale. Tutti gli input commerciali e operativi sono **H (ipotizzati)**; solo la tariffa carte SEE standard di Stripe è **V (verificata)**. Nessun cliente, fatturato, provider attivo per Soglia o disponibilità a pagare è affermato dal modello. La copertura italiana documentata per alcuni fornitori non prova accesso API/condizioni commerciali per Soglia, copertura degli utenti del pilot o diritto di condivisione; i costi restano H (ipotizzati).','', '## Offerte confrontate','', '| Modello | Pagante/unità | Prezzo da testare, netto IVA | Contenuto e limite |','|---|---|---:|---|','| B | Agenzia/proprietario ripetente; singolo rapporto | 29 € | Un candidato volontario già trovato dal cliente; attestazione solo con provider/ambito realmente supportati. Nessuna garanzia. |','| D | Piccola agenzia specializzata in affitti; vacancy/pratica | 99 € | Preparazione documentale, chiarimenti e stato della pratica per massimo 2 candidati volontari; verifica esterna facoltativa. Nessuna selezione automatizzata né garanzia. |','| E | Operatore con volume dimostrato; cliente/mese + vacancy | 79 €/mese + 39 €/vacancy | Flusso self-service, supporto ridotto; 1 candidato/controllo incluso per vacancy. Nessun controllo illimitato. |','', 'La verifica D produce rispettivamente 1,0 / 1,3 / 1,6 controlli richiesti per pratica nei tre scenari, sotto il tetto di 2; un’adozione maggiore aumenta i costi. B/D non hanno abbonamento. E è self-service e non offre la gestione assistita D: nel centrale dedica 32,3 minuti/pratica più 9 minuti per cliente-mese contro 64,1 minuti/pratica D (attivazione e vendita del cliente pagante aggiuntive). Il canone richiede un beneficio autonomo dimostrato: E centrale, a 1 vacancy/mese, paga 118 € contro 99 € per D assistito, ipotesi commerciale debole; chiedere almeno 2 vacancy pagate/mese o provare il valore del tool separatamente. E non sostituisce un CRM completo. A 40 vacancy pagate/anno E costa 62,70 €/vacancy; a 8/mese, 48,88 €; a 1/mese, 118 €; il canone richiede valore autonomo dimostrato. Tutti i tre modelli funzionano su candidati reperiti dal cliente, quindi non richiedono liquidità del marketplace.','', '## Formule e contabilità','', '- Le acquisizioni mensili sono interpolazioni lineari dei punti in `parameters.json`; valori frazionari = valore atteso di una coorte, non clienti osservati.','- Per ogni coorte k: clienti vivi nel mese t = nuovi_k × (1 − churn_mensile)^(t−k). Clienti attivi = somma delle coorti vive.','- B/D: pratiche_t = nuovi_t + clienti trattenuti_t × frequenza di riacquisto mensile. Ogni nuovo pagante genera una prima pratica; la sua ricerca/attivazione infruttuosa è inclusa nel CAC dei paganti acquisiti. Il churn indica la perdita del rapporto commerciale, non la cancellazione di un abbonamento.','- E: pratiche_t = clienti attivi_t × frequenza mensile; ricavo lordo netto IVA = 79 × clienti attivi + 39 × pratiche.','- Ricavi netti = ricavi listino × (1 − sconto) × (1 − rimborsi). Tentativi provider = controlli richiesti × (1 + gratuiti) × (1 + ripetizioni). Successi e fallimenti hanno costi distinti; le ripetizioni sono tentativi aggiuntivi attesi, non una probabilità geometrica nascosta.','- I controlli gratuiti sono extra non fatturati; le ripetizioni includono anche tali extra. Il numero di candidati resta 1 / massimo 2 / 1, quindi ripetere un controllo non introduce altri candidati.','- Stripe = 1,5% × incassato lordo IVA prima dei rimborsi + 0,25 € per transazione: una transazione per pratica, più una per cliente/mese E. Le commissioni originarie restano anche sui rimborsi. Fonte ufficiale: https://stripe.com/it/pricing (consultata 2026-10-03). Carte premium, estere, strumenti e chargeback con tariffe diverse richiedono un aggiornamento.','- Margine di contribuzione economico prima acquisizione = ricavi − provider − commissioni − costi contestazioni − lavoro di consegna/revisione/supporto/attivazione di entrambe le parti. Dopo acquisizione sottrae CAC monetario dei paganti e tempo/costo commerciale. Il CAC cash degli inquilini è 0 perché portati dal cliente; il loro tempo di attivazione non è 0.','- Sono previsti sia CAC cash sia ore commerciali per pagante: canali diversi possono richiedere entrambi. Il supporto agli operatori E è mensile anche senza pratiche. Nessuna formula di LTV SaaS viene applicata a B/D.','- Fondatore: 30 €/h economici per consegna/acquisizione più 40 h/mese di gestione fissa, che escludono vendita diretta, supporto e consegna già conteggiati nei costi variabili. Massimo 160 h/mese totali; le ore eccedenti sono affidate a un collaboratore a 35 €/h, costo cash. Il lavoro viene ripartito proporzionalmente tra consegna e acquisizione; un’ora non compare mai come costo del fondatore e collaboratore contemporaneamente.','- Costi fissi cash distinti: strumenti/infrastruttura, consulenze giuridiche e conformità, amministrazione. Non includono i costi provider o lavoro già variabili. Consulenze sono budget ipotetici, non pareri o preventivi.','- Risultato operativo economico = margine dopo acquisizione − fissi cash − gestione fondatore. Il risultato cash esclude il valore del lavoro del fondatore non pagato: **non è profitto sostenibile**.','- Setup mese 0: B 2.000 € + 120 h, D 3.000 € + 180 h, E 5.000 € + 300 h; ore startup distinte da 40 h/mese. Non sono costi mensili o ricavi; il risultato di progetto sottrae anche setup cash e valore ore setup. Il setup cash è al mese 0; le ore founder sono esplicitamente distribuite nei mesi 1–3: 40 h/mese B, 60 h/mese D, 100 h/mese E, prima di allocare capacità alle attività commerciali. Questo riduce la capacità operativa disponibile e può generare collaboratori già nei primi mesi; tutte le ore rientrano nel limite di 160 h/mese.','- Cash principale: pagamento anticipato immediato, costi nel mese; IVA segregata e fiscalmente neutra, nessun credito bancario, remunerazione founder cash o imposta sui redditi. Fabbisogno = peggior deficit cumulato (incluso setup) + riserva pari al maggiore tra 1.000 € e 3 mesi di fissi cash. Tale riserva non copre tre mesi di tutte le uscite variabili.','- Cash a 30 giorni: sposta tutti gli incassi netti di un mese e lascia i costi immediati; il mese 24 non incassa ancora il proprio fatturato. La sensitivity con prelievi founder paga 30 €/h incluse setup e gestione e aggiunge una riserva di tre mesi di fissi + prelievo founder del mese d’uscita: è un budget di sostentamento, non uno stipendio fiscalmente simulato.','- Rendimento delle ore = (cash operativo cumulato − setup cash) / (ore effettive founder operative + setup, già incluse nel totale mensile), dopo tutte le uscite esterne, CAC e collaboratori. È ante imposte e può essere negativo. Il target di 30 €/h corrisponde al pareggio economico di progetto.','', '## Input degli scenari','', '| Input | Prudente | Centrale | Favorevole |','|---|---:|---:|---:|']
    for label,key in [('Costo successo provider €','provider_success_cost_eur'),('Costo fallimento provider €','provider_failed_cost_eur'),('Fallimenti tentativi','provider_failed_attempt_rate'),('Tentativi di ripetizione extra','retry_attempts_ratio'),('Controlli gratuiti extra','free_checks_ratio'),('Sconti','discount_rate'),('Rimborsi sullo scontato','refund_rate'),('Contestazioni per pratica','dispute_rate')]:
        vals=[value(p['scenarios'][s],key) for s in p['scenarios']]
        lines.append('| '+label+' | '+' | '.join(dec(x) if 'eur' in key else dec(x*100)+'%' for x in vals)+' |')
    for m in p['models']:
        lines.extend(['',f'### Coorti {m}','', '| Input | Prudente | Centrale | Favorevole |','|---|---|---|---|'])
        for label,key,percentage in [('Nuovi clienti/mese, punti [mese: nuovi]','monthly_new_paying_clients_points',False),('Churn logo mensile','logo_churn_month',True),('Pratiche riacquisto/cliente/mese B-D; pratiche/cliente/mese E','practice_frequency_month',False),('CAC cash per pagante €','paying_client_cash_cac_eur',False),('Ore vendita/nuovo pagante','paying_client_acquisition_hours',False),('Ore attivazione/nuovo pagante','payer_activation_hours',False),('Ore revisione/pratica','manual_review_hours_practice',False),('Ore supporto/pratica','support_hours_practice',False),('Controlli richiesti/pratica','checks_per_practice',False)]:
            vals=[value(p['scenarios'][s],key)[m] for s in p['scenarios']]
            fmt=lambda x: ', '.join(f'{a}:{b}' for a,b in x) if isinstance(x,list) else dec(x*100)+'%' if percentage else f'{x:.2f}'.replace('.',',')
            lines.append('| '+label+' | '+' | '.join(fmt(x) for x in vals)+' |')
        md=p['models'][m]
        lines.append('')
        lines.append('Fissi mensili cash: '+', '.join(f'{label} {eur(value(md,k))}' for label,k in [('strumenti/infrastruttura','fixed_tools_infrastructure_eur_month'),('legale/conformità','fixed_legal_compliance_eur_month'),('amministrazione','fixed_admin_eur_month')])+'.')
    lines.extend(['','## Risultati cumulati, separati dalla redditività del mese finale','', '| Modello/scenario | Mesi | Attivi finali | Clienti-mese | Pratiche | Ricavi netti | Margine economico dopo acquisizione | Operativo economico | Progetto incl. setup | Cash con riserva | €/h founder | Operativo mese finale |','|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|'])
    for r in aggregates:
        lines.append(f'| {r["model"]}/{r["scenario"]} | {r["horizon_months"]} | {dec(r["active_paying_clients_exit"])} | {dec(r["client_months"])} | {dec(r["practices"])} | {eur(r["revenue_net"])} | {eur(r["contribution_economic_after_acquisition"])} | {eur(r["operating_economic"])} | {eur(r["project_economic_after_setup"])} | {eur(r["cash_requirement_with_reserve"])} | {dec(r["founder_economic_earnings_per_hour"])} | {eur(r["operating_economic_exit_month"])} |')
    lines.extend(['','Un risultato positivo nel mese 12/24 non cancella le perdite accumulate. I valori in `scenarios.csv` distinguono operativo, progetto, cash senza remunerazione founder, cash 30 giorni e budget con prelievi founder.','', '## Cash, tempo e costi su 24 mesi','', '| Modello/scenario | Margine prima acquisizione economico | Provider | CAC cash | Ore founder incl. setup | Ore collaboratore | Costi collaboratore | Cash immediato +riserva | Cash a30gg +riserva | Cash con prelievi founder |','|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|'])
    for r in aggregates:
        if r['horizon_months']==24:lines.append(f'| {r["model"]}/{r["scenario"]} | {eur(r["contribution_economic_before_acquisition"])} | {eur(r["provider_cost"])} | {eur(r["acquisition_cash"])} | {dec(r["founder_hours_including_setup"])} | {dec(r["contractor_hours"])} | {eur(r["contractor_cash"])} | {eur(r["cash_requirement_with_reserve"])} | {eur(r["cash_requirement_30d_with_reserve"])} | {eur(r["cash_requirement_with_founder_draws"])} |')
    lines.extend(['','## Pareggio annuale a regime, senza confonderlo con il cumulato','', 'A regime il churn va rimpiazzato: nuovi paganti = attivi × churn. B/D hanno le prime pratiche dei clienti sostitutivi e i riacquisti degli altri; E paga CAC sostitutivo e canone di tutti gli attivi. Si includono gestione founder, fissi e collaboratori se oltre 160 h. Le soglie sono matematiche, non prova che il bacino di clienti esista. Non recuperano setup o perdite iniziali.','', '| Modello/scenario | Attivi al pareggio | Pratiche/mese | Pratiche/anno | Ricavi annui netti | Ore founder/mese | Ore collaboratore/mese |','|---|---:|---:|---:|---:|---:|---:|'])
    for r in thresholds:
        if r['break_even_active_clients'] is None:lines.append(f'| {r["model"]}/{r["scenario"]} | Nessun pareggio ≤10.000 attivi | — | — | — | — | — |')
        else:lines.append(f'| {r["model"]}/{r["scenario"]} | {dec(r["break_even_active_clients"])} | {dec(r["break_even_practices_month"])} | {dec(r["break_even_practices_year"])} | {eur(r["break_even_revenue_year"])} | {dec(r["founder_hours_month"])} | {dec(r["contractor_hours_month"])} |')
    lines.extend(['','## Sensibilità su scenario centrale a 24 mesi','', 'Ogni riga cambia un solo input/gruppo rispetto al centrale. I minimi di provider 250/500/1.000 €/mese sono stress ipotetici, non preventivi o condizioni contrattuali rilevate. Il valore effettivo è da acquisire: nel caso base il minimo non è quantificato e viene omesso, rendendo la cassa potenzialmente sottostimata.','', '| Modello | Variante | Operativo economico cumulato | Progetto incl. setup | Operativo mese24 | Cash +riserva | €/h founder |','|---|---:|---:|---:|---:|---:|'])
    for r in sens:lines.append(f'| {r["model"]} | {r["case"]} | {eur(r["operating_economic_24"])} | {eur(r["project_economic_24"])} | {eur(r["operating_economic_exit_month"])} | {eur(r["cash_required"])} | {dec(r["founder_earnings_hour"])} |')
    lines.extend(['','## Prezzo D e tempo risparmiato al cliente','', 'Il valore di un’ora del cliente è H: 35 €/h. Se l’unico valore fosse il tempo, 79/99/129 € richiedono almeno 2,26/2,83/3,69 ore risparmiate per vacancy; la verifica esterna può aggiungere valore solo se dimostrato e non contato due volte. Il prezzo di 99 € rimane H in tutti gli scenari: favorevole non presuppone un aumento di prezzo. La selezione di agenzie con 40 locazioni/anno non implica 40 acquisti: la frequenza centrale di 1 pratica/mese equivale a 12/anno, cioè 30% di adozione su 40 locazioni. Acquisti, churn e acquisizioni sono ipotesi separate.', '', '## Limiti che decidono il test','', 'I prezzi hanno valore solo se il cliente paga per risparmio verificato. Per B il prezzo retail concorrente e il costo di acquisto del rapporto possono annullare la contribuzione; per D la preparazione deve ridurre davvero il tempo dell’operatore; E richiede operatori con bisogni ripetuti e valore del canone anche nei mesi tranquilli. Contratti provider, copertura di redditi autonomi/studenti e gestione degli errori vanno verificati prima di vendere l’attestazione. Il modello non mette un prezzo a un provider non ancora autorizzato/collegato.','', 'Non sono inclusi sinistri da garanzia perché l’offerta non concede garanzie. Non sono inclusi ricavi da intermediazione, interessi, depositi, classifiche di affidabilità, sovvenzioni o affari concluse nel marketplace. Normativa e condizioni provider possono imporre un perimetro diverso o costi iniziali superiori: le stime fisse e setup non costituiscono una conclusione legale.','', 'Le rate di acquisizione non derivano da un mercato validato: sono obiettivi H per testare soglie. Il CAC cash a pagante acquisito deve incorporare outreach infruttuoso e test di prezzo; le ore includono lo stesso lavoro distinto dalle spese cash. Il fatto che il modello assuma un pagante acquisito implica un pagamento, non una conversione garantita da un lead. Si sostituiscono i punti della rampa solo con misure reali di pipeline, accessibilità e conversione. D centrale acquisisce 24,5 paganti nei primi 12 mesi e 73,5 nei 24 mesi: un tasso finale H del 12% su 250 prospect (40% qualificati × 30% convertiti) genera 30 paganti, quindi l’obiettivo a 24 mesi richiede ampliare il bacino oltre 250 prospect/una sola città; non è implicita una sufficienza del primo elenco di 40 nominativi.','', '## Riproducibilità','', '`python3 economics.py --parameters parameters.json --output-dir .`','', 'Output: `monthly.csv` (216 righe mensili, 9 scenari), `scenarios.csv` (18 aggregazioni 12/24 mesi), `break_even.csv`, `sensitivity.csv`. I CSV conservano più precisione delle tabelle. Le verifiche interne controllano somme, ricavi, costo founder, vincoli ore e cassa. A volumi e costi centrali invariati, D richiederebbe 103,76 € per azzerare il solo mese 24, 153,45 € per azzerare l’operativo cumulato a 24 mesi e 170,78 € per azzerare il progetto incluso setup: sono soglie di calcolo, non prezzi validati; cambiare prezzo può ridurre le vendite. Il recupero del costo commerciale D centrale richiede 4 pratiche pagate per nuovo cliente prima dei fissi: contribuzione ricorrente di 42,53 €/pratica, acquisizione/attivazione cash + lavoro pari a 130,50 € aggiuntivi alla prima pratica.'])
    (out/'economics.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')

def validate(p,monthly,aggregates):
    for r in monthly:
        assert abs(r['provider_attempts']-r['provider_successes']-r['provider_failures'])<1e-7
        assert r['founder_hours']<=value(p['general'],'founder_hours_month_cap')+1e-8
        assert abs(r['operating_cash']-r['founder_economic_cost']-r['operating_economic'])<1e-6
        assert r['checks_requested']<=r['candidates_activated']+1e-8
        assert abs(r['revenue_net']-r['gross_revenue_net_vat']+r['discounts']+r['refunds'])<1e-6
    for a in aggregates:
        assert abs(a['operating_cash']-a['setup_cash']-a['cumulative_cash_after_setup'])<1e-6
        assert a['cash_requirement_30d_with_reserve']>=a['cash_requirement_with_reserve']-1e-6
    assert len(monthly)==216 and len(aggregates)==18

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--parameters',type=Path,default=ROOT/'parameters.json');ap.add_argument('--output-dir',type=Path,default=ROOT)
    a=ap.parse_args();p=json.loads(a.parameters.read_text());a.output_dir.mkdir(parents=True,exist_ok=True)
    monthly,aggregates,thresholds=[],[],[]
    for m in p['models']:
        for s in p['scenarios']:
            rows=run(p,m,s);monthly.extend(rows)
            for horizon in [12,24]:aggregates.append(aggregate(p,rows,horizon))
            thresholds.append(break_even(p,m,s))
    sens=sensitivity(p);validate(p,monthly,aggregates)
    for name,rows in [('monthly.csv',monthly),('scenarios.csv',aggregates),('break_even.csv',thresholds),('sensitivity.csv',sens)]:write_csv(a.output_dir/name,rows)
    report(p,aggregates,thresholds,sens,a.output_dir)
    print(json.dumps({'validated':True,'monthly_rows':len(monthly),'scenario_rows':len(aggregates),'output_dir':str(a.output_dir),'24month_results':[{k:r[k] for k in ['model','scenario','operating_economic','project_economic_after_setup','cash_requirement_with_reserve','founder_economic_earnings_per_hour','operating_economic_exit_month']} for r in aggregates if r['horizon_months']==24]},ensure_ascii=False,indent=2))

if __name__=='__main__':main()
