#!/usr/bin/env python3
"""Source-free hypotheses; matched cohorts; distinct startup, operating and cash accounting.
python economics_v2.py --inputs inputs_v2.json --output-dir .
Standard library only. No real customers or validated willingness to pay assumed.
"""
import argparse, copy, csv, json, math, re
from pathlib import Path
ROOT=Path(__file__).resolve().parent

def v(block,key):return block[key]['value']
def ramp(points,m):
    if m<=points[0][0]:return float(points[0][1])
    for (a,x),(b,y) in zip(points,points[1:]):
        if m<=b:return x+(y-x)*(m-a)/(b-a)
    return float(points[-1][1])

def simulate(p,offer,scenario,overrides=None):
    g={k:x['value'] for k,x in p['general'].items()}
    d={k:x['value'] for k,x in p['offers'][offer].items() if isinstance(x,dict)}
    s={k:x['value'] for k,x in p['scenarios'][scenario].items()}
    if overrides:
        for k,x in overrides.items():
            if k in g:g[k]=x
            elif k in d:d[k]=x
            else:s[k]=x
    cohorts=[];monthly=[];cum_installed=0.;partners=0
    cum_cash=-d['startup_cash_eur'];cum_econ=cum_cash;cum_cash30=cum_cash;prev_rev=0.
    fixed=sum(g[k] for k in ['fixed_compliance_eur_month','fixed_infrastructure_eur_month','fixed_admin_eur_month'])
    for month in range(1,25):
        new=ramp(s['new_installed_customers_points'],month)*s.get('demand_multiplier',1.)
        attach=1. if offer=='F' else g['maintenance_attach']
        retained=sum(n*attach*(1-s['monthly_logo_churn'])**(month-k) for k,n in cohorts)
        active=retained+new*attach
        service_clients=active+(new*(1-attach) if offer!='F' else 0.)
        nonmaint_new_warranty=new*(1-attach) if offer!='F' else 0.
        cohorts.append((month,new));cum_installed+=new
        new_partners=0
        if offer=='H':
            required=math.ceil(cum_installed/g['installed_customers_per_partner']-1e-12) if cum_installed else 0
            new_partners=max(required-partners,0);partners=required
        gross_setup=new*d['setup_price_net_eur'];gross_monthly=active*d['monthly_price_net_eur']
        factor=(1-s['discount'])*(1-s['refund_rate'])
        setup_rev=gross_setup*factor;monthly_rev=gross_monthly*factor;rev=setup_rev+monthly_rev
        discounts=(gross_setup+gross_monthly)*s['discount'];refunds=(gross_setup+gross_monthly)*(1-s['discount'])*s['refund_rate']
        share=(rev*g['partner_revenue_share']) if offer=='H' else 0.
        # One setup payment/new installed client + one monthly payment/active subscription.
        # H assumes Soglia is merchant and pays reseller share; alternative merchant terms unknown.
        payment=(gross_setup+gross_monthly)*(1-s['discount'])*(1+g['vat_hypothesis'])*g['stripe_percent']+(new+active)*g['stripe_fixed_eur']
        tool=service_clients*g['tool_cost_serviced_customer_month']
        candidate_entries=service_clients*g['entries_customer_month']
        exception_entries=candidate_entries*g['exception_rate']
        exception_h=exception_entries*g['minutes_per_exception']/60.
        customer_support_h=active*g['support_hours_active_customer_month']+nonmaint_new_warranty*g['warranty_support_hours_new_customer']
        install_h=new*d['delivery_hours_new_customer'];sales_h=new*d['sales_hours_new_customer']
        partner_enable_h=new_partners*g['partner_enable_hours'];partner_sales_h=new_partners*g['partner_sales_hours']
        partner_support_h=partners*g['partner_support_hours_month']
        acquisition_h=sales_h+partner_sales_h
        delivery_h=install_h+exception_h+customer_support_h+partner_enable_h+partner_support_h
        variable_h=acquisition_h+delivery_h
        startup_demand_h=d['startup_founder_hours']/g['setup_spread_months'] if month<=g['setup_spread_months'] else 0.
        available=max(g['founder_cap_hours_month']-g['management_hours_month'],0.)
        founder_startup_h=min(available,startup_demand_h)
        contractor_startup_h=max(startup_demand_h-founder_startup_h,0.)
        capacity=max(available-founder_startup_h,0.)
        founder_fraction=min(1.,capacity/variable_h) if variable_h else 1.
        founder_delivery_h=delivery_h*founder_fraction;founder_acquisition_h=acquisition_h*founder_fraction
        contractor_delivery_h=delivery_h-founder_delivery_h;contractor_acquisition_h=acquisition_h-founder_acquisition_h
        contractor_delivery_cost=contractor_delivery_h*g['contractor_hour_eur'];contractor_acquisition_cost=contractor_acquisition_h*g['contractor_hour_eur']
        contractor_startup_cost=contractor_startup_h*g['contractor_hour_eur']
        customer_cac=new*d['customer_cash_cac_eur'];partner_cac=new_partners*g['partner_acquisition_cash_eur']
        cash_before=rev-share-payment-tool-contractor_delivery_cost
        econ_before=cash_before-founder_delivery_h*g['founder_hour_eur']
        cash_after=cash_before-customer_cac-partner_cac-contractor_acquisition_cost
        econ_after=econ_before-customer_cac-partner_cac-contractor_acquisition_cost-founder_acquisition_h*g['founder_hour_eur']
        op_cash=cash_after-fixed
        founder_op_h=g['management_hours_month']+founder_delivery_h+founder_acquisition_h
        founder_total_h=founder_op_h+founder_startup_h
        founder_op_cost=founder_op_h*g['founder_hour_eur']
        op_econ=op_cash-founder_op_cost
        startup_month_econ=founder_startup_h*g['founder_hour_eur']+contractor_startup_cost
        cum_cash+=op_cash-contractor_startup_cost
        cash30=op_cash-rev+prev_rev-contractor_startup_cost
        cum_cash30+=cash30;prev_rev=rev
        cum_econ+=op_econ-startup_month_econ
        monthly.append(dict(offer=offer,scenario=scenario,month=month,new_installed_customers=new,cumulative_installed_customers=cum_installed,retained_subscription_customers=retained,new_subscribers=new*attach,active_subscribers=active,subscriber_months=active,serviced_customer_months=service_clients,first_month_nonmaintenance_warranty_customers=nonmaint_new_warranty,new_partners=new_partners,active_enabled_partners=partners,candidate_entries_supported=candidate_entries,exception_entries=exception_entries,exception_hours=exception_h,customer_support_hours=customer_support_h,installation_hours=install_h,sales_hours=sales_h,partner_enable_hours=partner_enable_h,partner_sales_hours=partner_sales_h,partner_support_hours=partner_support_h,gross_setup_revenue_net_vat=gross_setup,gross_monthly_revenue_net_vat=gross_monthly,discounts=discounts,refunds=refunds,setup_revenue_net=setup_rev,monthly_revenue_net=monthly_rev,revenue_net=rev,partner_revenue_share=share,payment_cost=payment,tool_cost=tool,customer_cac_cash=customer_cac,partner_cac_cash=partner_cac,contribution_cash_before_acquisition=cash_before,contribution_economic_before_acquisition=econ_before,contribution_cash_after_acquisition=cash_after,contribution_economic_after_acquisition=econ_after,fixed_cash=fixed,founder_delivery_hours=founder_delivery_h,founder_acquisition_hours=founder_acquisition_h,founder_startup_hours=founder_startup_h,founder_operating_hours=founder_op_h,founder_total_hours=founder_total_h,founder_operating_cost=founder_op_cost,contractor_delivery_hours=contractor_delivery_h,contractor_acquisition_hours=contractor_acquisition_h,contractor_startup_hours=contractor_startup_h,contractor_cash=contractor_delivery_cost+contractor_acquisition_cost,contractor_startup_cash=contractor_startup_cost,operating_cash=op_cash,operating_economic=op_econ,startup_economic_cost_month=startup_month_econ,cumulative_cash=cum_cash,cashflow_30d=cash30,cumulative_cash_30d=cum_cash30,cumulative_project_economic=cum_econ))
    return monthly

def summarize(p,rows,horizon,overrides=None):
    r=rows[:horizon];offer=r[0]['offer'];g={k:x['value'] for k,x in p['general'].items()};d={k:x['value'] for k,x in p['offers'][offer].items() if isinstance(x,dict)}
    if overrides:
        g.update({k:x for k,x in overrides.items() if k in g});d.update({k:x for k,x in overrides.items() if k in d})
    sm=lambda key:sum(x[key] for x in r)
    setup_cash=d['startup_cash_eur']+sm('contractor_startup_cash')
    max_deficit=max(d['startup_cash_eur'],0.,-min(x['cumulative_cash'] for x in r))
    deficit30=max(d['startup_cash_eur'],0.,-min(x['cumulative_cash_30d'] for x in r))
    reserve=max(g['minimum_reserve_eur'],r[-1]['fixed_cash']*g['reserve_months_fixed_cash'])
    drawcum=-d['startup_cash_eur'];drawdef=max(0.,-drawcum)
    for x in r:
        drawcum+=x['operating_cash']-x['founder_total_hours']*g['founder_hour_eur']-x['contractor_startup_cash']
        drawdef=max(drawdef,-drawcum)
    drawreserve=max(g['minimum_reserve_eur'],g['reserve_months_fixed_cash']*(r[-1]['fixed_cash']+r[-1]['founder_total_hours']*g['founder_hour_eur']))
    founderhours=sm('founder_total_hours');earnings=sm('operating_cash')-setup_cash
    return dict(offer=offer,scenario=r[0]['scenario'],horizon_months=horizon,installed_customers=sm('new_installed_customers'),active_subscribers_exit=r[-1]['active_subscribers'],subscriber_months=sm('subscriber_months'),serviced_customer_months=sm('serviced_customer_months'),enabled_partners_exit=r[-1]['active_enabled_partners'],partner_enable_hours=sm('partner_enable_hours'),partner_sales_hours=sm('partner_sales_hours'),partner_support_hours=sm('partner_support_hours'),partner_cash_cac=sm('partner_cac_cash'),candidate_entries_supported=sm('candidate_entries_supported'),exception_hours=sm('exception_hours'),setup_revenue_net=sm('setup_revenue_net'),monthly_revenue_net=sm('monthly_revenue_net'),revenue_net=sm('revenue_net'),partner_revenue_share=sm('partner_revenue_share'),payment_cost=sm('payment_cost'),tool_cost=sm('tool_cost'),customer_cash_cac=sm('customer_cac_cash'),contribution_cash_before_acquisition=sm('contribution_cash_before_acquisition'),contribution_economic_before_acquisition=sm('contribution_economic_before_acquisition'),contribution_cash_after_acquisition=sm('contribution_cash_after_acquisition'),contribution_economic_after_acquisition=sm('contribution_economic_after_acquisition'),fixed_cash=sm('fixed_cash'),operating_cash=sm('operating_cash'),operating_economic=sm('operating_economic'),startup_cash=setup_cash,startup_founder_hours=sm('founder_startup_hours'),project_economic=r[-1]['cumulative_project_economic'],cash_after_startup=earnings,max_cash_deficit=max_deficit,cash_reserve=reserve,cash_requirement_with_reserve=max_deficit+reserve,cash_requirement_30d_with_reserve=deficit30+reserve,cash_requirement_founder_draws=drawdef+drawreserve,founder_hours_including_startup=founderhours,contractor_hours=sm('contractor_delivery_hours')+sm('contractor_acquisition_hours')+sm('contractor_startup_hours'),contractor_cash=sm('contractor_cash')+sm('contractor_startup_cash'),founder_earnings_per_hour=earnings/founderhours if founderhours else 0.,operating_economic_exit_month=r[-1]['operating_economic'],setup_revenue_exit_month=r[-1]['setup_revenue_net'],monthly_revenue_exit_month=r[-1]['monthly_revenue_net'],founder_hours_exit_month=r[-1]['founder_total_hours'],new_installed_customers_exit_month=r[-1]['new_installed_customers'])

def sensitivities(p):
    cases=[('centrale',{}),('zero clienti',{'demand_multiplier':0.}),('installazioni -50%',{'demand_multiplier':.5}),('installazioni +50%',{'demand_multiplier':1.5}),('setup249',{'setup_price_net_eur':249}),('setup490',{'setup_price_net_eur':490}),('setup790',{'setup_price_net_eur':790}),('setup790 e installazioni -30%',{'setup_price_net_eur':790,'demand_multiplier':.7}),('setup790, installazioni -30%, mantenimento0%',{'setup_price_net_eur':790,'demand_multiplier':.7,'maintenance_attach':0.}),('mensile79',{'monthly_price_net_eur':79}),('commerciale6h/cliente',{'sales_hours_new_customer':6}),('installazione8h/cliente',{'delivery_hours_new_customer':8}),('CACcash80/cliente',{'customer_cash_cac_eur':80}),('commerciale6h e CACcash100',{'sales_hours_new_customer':6,'customer_cash_cac_eur':100}),('rimborsi10%',{'refund_rate':.1}),('eccezioni25%',{'exception_rate':.25}),('gestione40h/mese',{'management_hours_month':40}),('mantenimento30%',{'maintenance_attach':.3}),('mantenimento0%',{'maintenance_attach':0.}),('avvio cash+5000',{'startup_cash_eur':None}),('quota partner15%',{'partner_revenue_share':.15}),('quota partner40%',{'partner_revenue_share':.4}),('produttività partner2clienti',{'installed_customers_per_partner':2})]
    out=[]
    for offer in p['offers']:
        for label,override in cases:
            if (label.startswith('quota partner') or label.startswith('produttività partner')) and offer!='H':continue
            if (label.startswith('mantenimento') or 'mantenimento0%' in label) and offer=='F':continue
            if label=='setup490' and offer in ['G','H']:continue
            z=override.copy()
            if z.get('startup_cash_eur','sentinel') is None:z['startup_cash_eur']=v(p['offers'][offer],'startup_cash_eur')+5000
            a=summarize(p,simulate(p,offer,'centrale',z),24,z)
            out.append(dict(offer=offer,case=label,revenue_net_24=a['revenue_net'],operating_economic_24=a['operating_economic'],project_economic_24=a['project_economic'],cash_requirement=a['cash_requirement_with_reserve'],cash_requirement_founder_draws=a['cash_requirement_founder_draws'],founder_earnings_per_hour=a['founder_earnings_per_hour'],operating_economic_exit_month=a['operating_economic_exit_month'],contractor_hours=a['contractor_hours']))
    return out

def csvwrite(path,rows):
    with path.open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader()
        for row in rows:w.writerow({k:round(x,6) if isinstance(x,float) else x for k,x in row.items()})
def euro(x):return f'{x:,.0f}'.replace(',','.')+' €'
def num(x):return f'{x:.1f}'.replace('.',',')

def validate(p,monthly,aggregates):
    assert len(monthly)==216 and len(aggregates)==18
    grouped={}
    for x in monthly:
        assert x['founder_total_hours']<=v(p['general'],'founder_cap_hours_month')+1e-8
        assert abs(x['operating_cash']-x['founder_operating_cost']-x['operating_economic'])<1e-6
        assert abs(x['revenue_net']-x['setup_revenue_net']-x['monthly_revenue_net'])<1e-6
        assert abs(x['gross_setup_revenue_net_vat']+x['gross_monthly_revenue_net_vat']-x['discounts']-x['refunds']-x['revenue_net'])<1e-6
        if x['offer']=='H':
            expected=math.ceil(x['cumulative_installed_customers']/v(p['general'],'installed_customers_per_partner')-1e-12) if x['cumulative_installed_customers'] else 0
            assert x['active_enabled_partners']==expected
        if x['offer']=='F':assert abs(x['serviced_customer_months']-x['active_subscribers'])<1e-8
        grouped.setdefault((x['scenario'],x['month']),[]).append(x['new_installed_customers'])
    for counts in grouped.values():assert max(counts)-min(counts)<1e-8
    for x in aggregates:
        assert abs(x['project_economic']-(x['operating_economic']-x['startup_cash']-x['startup_founder_hours']*v(p['general'],'founder_hour_eur')))<1e-6
        assert abs(x['cash_after_startup']-(x['operating_cash']-x['startup_cash']))<1e-6
        assert x['cash_requirement_30d_with_reserve']>=x['cash_requirement_with_reserve']-1e-6
        if x['offer']=='H':
            assert abs(x['partner_enable_hours']-x['enabled_partners_exit']*v(p['general'],'partner_enable_hours'))<1e-6
            assert abs(x['partner_sales_hours']-x['enabled_partners_exit']*v(p['general'],'partner_sales_hours'))<1e-6
            assert abs(x['partner_cash_cac']-x['enabled_partners_exit']*v(p['general'],'partner_acquisition_cash_eur'))<1e-6

def report(p,a,sens,out):
    lines=['# Economia v2 — vendere un’installazione utile prima di costruire software','', 'Data:2026-10-03. File separati dal modello precedente. Tutti i prezzi, volumi, percentuali e tempi sono H (ipotizzati); solo la tariffa Stripe è V. Nessuna vendita, intervista, richiesta d’offerta, conversione o unicità del prodotto viene affermata. Le funzionalità di CRM e moduli già disponibili possono rendere la disponibilità a pagare **zero**. Il problema pagabile proposto è una configurazione consegnata e adottata, non l’accesso a un modulo generico.','', '| Offerta | Setup cliente netto IVA | Mensile netto IVA | Costo startup cash / ore founder | Consegna / vendita per installazione |','|---|---:|---:|---:|---:|','| F microSaaS diretto |149 €|49 €, tutti gli attivi|3.000 € /100 h|2 h /3 h|','| G installazione negli strumenti dell’agenzia |490 €|49 € facoltativi,60% acquista|2.500 € /40 h|4 h /3 h|','| H installazione via web agency |490 €|49 € facoltativi,60% acquista|2.500 € /40 h|3 h /1 h + attivazione partner|','', 'G/H hanno stesso perimetro: preferenze, appuntamenti, campi mancanti e notifiche con dati minimi negli strumenti dell’agenzia. Un massimo di un workflow, un modulo, un calendario/e-mail ed esportazione CRM nativa se disponibile; nessuna API o integrazione personalizzata inclusa. Se il passaggio nativo non è supportato si usa CSV: il lavoro di esportazione dell’agenzia resta nel confronto con il suo processo attuale. Non offrono istruttorie reddituali, scoring, garanzie o mediazione. F comporta sviluppo/hosting e rinnovi obbligatori per restare attivi; G/H consegnano un workflow che resta all’agenzia. Senza manutenzione si riceve solo assistenza commerciale nel primo mese, poi nessun supporto/hosting continuativo Soglia. La durata commerciale ipotizzata non elimina obblighi inderogabili di correzione, responsabilità o diritti previsti dal contratto/legge: da verificare con consulente, e costi ulteriori aggiornerebbero il modello. Verifiche reddituali facoltative sono acquistate direttamente dall’agenzia: ricavo e COGS Soglia sono0, ma il costo per il compratore non è0. Licenze CRM/form/automazioni necessarie sono del cliente; preventivo complessivo deve indicarle. Insurance/referral revenue=0.','', '## Formule e unità','', '- Confronto a coorti identiche: nuove installazioni pagate consegnate/mese uguali F/G/H. Centrale:1 nel mese1,2 al6,3 al12,4 al18,5 al24, interpolazione lineare;24,5 installazioni a12 mesi,73,5 a24. Prudente:0 fino al3,1 al6/12,2 al18/24. Favorevole:1/3/5/7/9 ai mesi1/6/12/18/24. Nessuna evidenza sostiene queste rampe.','- F: abbonati attivi=sum(nuovi_coorte × (1−churn)^(età_coorte)). G/H: manutentori attivi=sum(nuovi_coorte ×60% × (1−churn)^(età_coorte)). Churn mensile8%/5%/3%. Il cliente che termina manutenzione conserva l’installazione; non viene riacquisito o rivenduto ogni mese.','- Ricavo setup=nuove installazioni × prezzo_setup; ricavo mensile=abbonati/mantenutori attivi × prezzo_mese. Ricavi netti=(setup+mensile)×(1−sconto)×(1−rimborso); sconti10%/5%/2%, rimborsi5%/3%/1,5%. La manutenzione acquistata comincia subito; chi non la compra non genera ricavi mensili.','- Setup una tantum: non è MRR, non è LTV SaaS e non è canone annuale incassato anticipatamente. Nessun rinnovo d’installazione viene ipotizzato.','- Clienti serviti F=tutti gli attivi. G/H=manutentori attivi + nuove installazioni senza manutenzione per garanzia primo mese. Gli aderenti alla manutenzione nel primo mese non vengono duplicati. Assumiamo100 ingressi candidati per ciascun cliente servito in ogni mese, compreso l’intero primo mese: da verificare, non attività osservata.','- Eccezioni tecniche del workflow, non screening/lettura documenti/chiamate agli inquilini: l’agenzia gestisce candidati e domande. Sono H: ingressi ×5% ×4 minuti/60=0,333 h/cliente servito-mese; supporto0,25h aggiuntive. Nessuna istruttoria finanziaria né revisione di persone. Stress25% eccezioni dà1,667 h extra/cliente-mese.','- H: partner abilitati=ceil(installazioni cumulative/5). Solo il nuovo partner genera8h abilitazione +5h vendita e50€ CAC cash; tutti i partner abilitati richiedono0,5h/mese supporto. Nessun accordo, cliente/partner reale o produttività del canale è verificato. La commissione30% riguarda setup e canone netti dopo sconto/rimborso, prima dei costi Stripe.','- Stripe ipotizza Soglia come venditore anche H:1,5% sul lordo IVA22% incassato prima dei rimborsi +0,25€ per pagamento setup e0,25€ per abbonato/mese. Commissioni originarie non rimborsate. Tariffa V: https://stripe.com/it/pricing consultata2026-10-03; IVA22% H, regime da definire. Il modello può cambiare con reseller diverso merchant.','- Hosting/servizio3€ per cliente servito-mese; CAC pagante40€ F/G,15€ H; le ore di vendita includono prospecting fallito e sono distinte da tali spese cash. Nessun CAC inquilini: portati dall’agenzia, attivazione self-service e gestione delle eccezioni contata.','- Founder30€/h; gestione fissa12h/mese esclusa dai tempi variabili; stress40h. Fissi cash250€/mese=conformità100+infrastruttura50+amministrazione100; H, non preventivi. Le licenze del cliente non sono implicitamente gratuite e non diventano COGS Soglia.','- Startup cash al mese0, ore startup distribuite nei mesi1-3 e comprese nel limite totale160h founder/mese. Ore eccedenti affidate a collaboratori35€/h, cash, ripartite in proporzione tra consegna e acquisizione: nessun doppio conteggio con lavoro founder.','- Margine economico prima acquisizione=ricavi−commissione partner−Stripe−tool−lavoro consegna/supporto/eccezioni/abilitazione e supporto partner; dopo acquisizione sottrae CAC cash e ore vendita clienti/partner. Abilitazione partner è consegna una tantum; il relativo CAC comprende separatamente tempo vendita e spesa50€.','- Operativo economico=contribuzione dopo acquisizione−fissi cash−gestione founder. Progetto=operativo cumulato−startup cash−lavoro startup. Cash non remunera founder nel caso principale e non equivale a profitto. Rendimento founder=(cash operativo−startup cash)/ore effettive founder incluse startup, dopo tutte le spese esterne.','- Incassi anticipati immediati per installazione consegnata e canone mensile; nessun finanziamento di clienti o incasso annuale anticipato. Alternativa30giorni rinvia tutti gli incassi di un mese. IVA segregata/fiscalmente neutra, imposte sui redditi escluse. Riserva=max(1.000€,3mesi fissi cash). Non copre3mesi di tutte le uscite.','- Scenario con prelievi founder30€/h paga anche startup/gestione e tiene3mesi di riserva di fissi+prelievo del mese finale. Tale budget non simula uno stipendio fiscale.','', '## Risultati cumulati','', '|Offerta/scenario|Mesi|Installazioni|Abbonati finali|Ricavi netti|Operativo economico|Progetto incluso startup|Cash +riserva founder non pagato|€/h founder|Operativo mese finale|','|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|']
    for x in a:lines.append('|'+f'{x["offer"]}/{x["scenario"]}|{x["horizon_months"]}|{num(x["installed_customers"])}|{num(x["active_subscribers_exit"])}|{euro(x["revenue_net"])}|{euro(x["operating_economic"])}|{euro(x["project_economic"])}|{euro(x["cash_requirement_with_reserve"])}|{num(x["founder_earnings_per_hour"])}|{euro(x["operating_economic_exit_month"])}|')
    lines.extend(['','Un mese finale positivo non recupera le perdite iniziali. Il setup monetizza una consegna: continuare a vendere installazioni è una necessità commerciale, non ricorrenza garantita.','', '## Composizione ricavi, cassa e tempo a24 mesi','', '|Offerta/scenario|Ricavi setup|Ricavi canoni|Ore founder incl.startup|Ore collaboratori|Quota partner|Cash immediato +riserva|Cash30gg +riserva|Cash con prelievi founder|','|---|---:|---:|---:|---:|---:|---:|---:|---:|'])
    for x in a:
        if x['horizon_months']==24:lines.append(f'|{x["offer"]}/{x["scenario"]}|{euro(x["setup_revenue_net"])}|{euro(x["monthly_revenue_net"])}|{num(x["founder_hours_including_startup"])}|{num(x["contractor_hours"])}|{euro(x["partner_revenue_share"])}|{euro(x["cash_requirement_with_reserve"])}|{euro(x["cash_requirement_30d_with_reserve"])}|{euro(x["cash_requirement_founder_draws"])}|')
    lines.extend(['','## Sensibilità centrale a24 mesi','', 'Ogni riga modifica un solo parametro/gruppo. Cambiare prezzo lascia volumi invariati per misurare una soglia matematica: la domanda può crollare, nessuna elasticità o accettazione è affermata. La variante con setup790 e30% di clienti in meno è un test congiunto ipotetico, non elasticità stimata. Setup249/490/790 e canone79 sono H. Il mantenimento0% riguarda G/H, senza trasformare una garanzia di un mese in supporto gratuito permanente.','', '|Offerta|Variante|Progetto24mesi|Cash +riserva|Cash con prelievi|€/h founder|Operativo mese24|Ore collaboratori|','|---|---|---:|---:|---:|---:|---:|---:|'])
    for x in sens:lines.append(f'|{x["offer"]}|{x["case"]}|{euro(x["project_economic_24"])}|{euro(x["cash_requirement"])}|{euro(x["cash_requirement_founder_draws"])}|{num(x["founder_earnings_per_hour"])}|{euro(x["operating_economic_exit_month"])}|{num(x["contractor_hours"])}|')
    lines.extend(['','## Perché testare G prima, senza affermare superiorità universale','', 'G è il test iniziale di costo e complessità ridotti: startup40h/2.500€ e installazione su strumenti posseduti dal cliente. Questo non dimostra superiorità economica universale. F a790€ può generare più profitto se sostiene la stessa pagabilità con2h di attivazione e gli stessi clienti, ipotesi ancora ignote; diventa candidato dopo la validazione di G. Il prezzo F790 è già presente nella sensibilità e non va nascosto.','', '### G a790€ con30% di installazioni in meno: cumulato12/24mesi','', '| Mantenimento | Mesi | Installazioni | Ricavi netti | Operativo economico | Progetto incluso startup | Cash +riserva, founder non pagato | €/h founder | Operativo mese finale |','|---|---:|---:|---:|---:|---:|---:|---:|---:|','', '## Condizioni che decidono il test','', 'TCO per cliente G/H che mantiene12mesi:490 +49×12=1.078€ nell’anno1, prima delle licenze degli strumenti e di verifiche eventualmente acquistate direttamente. Con valore H35€/h, il solo risparmio di tempo deve superare2,57ore/mese; a790€ setup+49€/mese ilTCOanno1è1.378€ e richiede3,28ore/mese; target da misurare4–5ore/mese nette a≥100richieste/mese (circa2,4–3minuti per richiesta). Deve trattarsi di tempo incrementale risparmiato rispetto al CRM/moduli esistenti, sottraendo CSV, manutenzione e nuove attività, non confrontando contro un processo manuale che l’agenzia non usa. Budget del compratore e beneficio non sono provati.','', 'La principale incertezza è pagare per attività che l’agenzia può svolgere con il proprio CRM o con moduli gratuiti. Dimostrare che il servizio risolve configurazione, adozione, errori e tempo oggi speso; non vendere una presunta invenzione. Acquisizioni identiche rendono confrontabili gli economics, ma non provano che F/G/H trovino gli stessi clienti: il vantaggio distributivo H va misurato separatamente. Commissione partner30% non è quotata e non dovrebbe essere promessa prima del test.','', 'Il prezzo del pacchetto include soltanto il perimetro concordato: campi/automazioni/proprietà degli strumenti, periodo di garanzia e manutenzione devono essere espliciti. Richieste extra, software legacy e migrazioni ampliano le ore: stress8h di consegna. Il budget conformità100€/mese e startup2.500€ è H; stress+5.000€ copre un costo iniziale superiore ma non risolve un requisito normativo non supportato.','', 'Il modello non dimostra un business “senza lavoro” o una rendita: la crescita G/H richiede nuove installazioni. Assenza di clienti è simulata; non effettuare sviluppo prima di pagamenti, non assumere rinnovi per contratti non comprati. Lo scenario favorevole è un limite condizionato, non una previsione.','', '## Riproducibilità','', '`python3 economics_v2.py --inputs inputs_v2.json --output-dir .`','', 'Output:monthly_v2.csv (216righe),scenarios_v2.csv (18aggregati),sensitivity_v2.csv. Controlli su coorti identiche, cap ore, avvio/cassa, formule dei ricavi e conteggio dei partner. Il modello precedente è conservato intatto.'])
    variant_table=[]
    for label,attach in [('60% H',.6),('Nessun acquisto',0.)]:
        overrides={'setup_price_net_eur':790,'demand_multiplier':.7,'maintenance_attach':attach}
        variant_rows=simulate(p,'G','centrale',overrides)
        for horizon in [12,24]:
            x=summarize(p,variant_rows,horizon,overrides)
            variant_table.append(f'|{label}|{horizon}|{num(x["installed_customers"])}|{euro(x["revenue_net"])}|{euro(x["operating_economic"])}|{euro(x["project_economic"])}|{euro(x["cash_requirement_with_reserve"])}|{num(x["founder_earnings_per_hour"])}|{euro(x["operating_economic_exit_month"])}|')
    marker=lines.index('## Condizioni che decidono il test')
    if marker and lines[marker-1]=='':
        del lines[marker-1];marker-=1
    lines[marker:marker]=variant_table+['', 'Il30% di calo installazioni e il prezzo790 sono ipotesi combinate, non risultati di un test. La perdita del primo anno conta anche se il mese finale diventa positivo.', '']
    formatted=[]
    for line in lines:
        if line.startswith('`python') or line.startswith('Output:'):
            formatted.append(line);continue
        line=line.replace('ilTCOanno','il TCO anno').replace('Data:2026','Data: 2026')
        line=re.sub(r'(?<=[A-Za-zÀ-ÿ])(?=[0-9])',' ',line)
        line=re.sub(r'(?<=[0-9])(?=[A-Za-zÀ-ÿ€])',' ',line)
        line=line.replace('v 2','v2')
        formatted.append(line)
    (out/'economics_v2.md').write_text('\n'.join(formatted)+'\n',encoding='utf-8')

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--inputs',type=Path,default=ROOT/'inputs_v2.json');ap.add_argument('--output-dir',type=Path,default=ROOT)
    opts=ap.parse_args();p=json.loads(opts.inputs.read_text());opts.output_dir.mkdir(parents=True,exist_ok=True)
    monthly=[];a=[]
    for offer in p['offers']:
        for scenario in p['scenarios']:
            rows=simulate(p,offer,scenario);monthly.extend(rows)
            for n in [12,24]:a.append(summarize(p,rows,n))
    sens=sensitivities(p);validate(p,monthly,a)
    for name,rows in [('monthly_v2.csv',monthly),('scenarios_v2.csv',a),('sensitivity_v2.csv',sens)]:csvwrite(opts.output_dir/name,rows)
    report(p,a,sens,opts.output_dir)
    print(json.dumps({'verified':True,'monthly_rows':len(monthly),'aggregates':len(a),'central':[{k:x[k] for k in ['offer','horizon_months','installed_customers','revenue_net','operating_economic','project_economic','cash_requirement_with_reserve','cash_requirement_founder_draws','founder_earnings_per_hour','operating_economic_exit_month']} for x in a if x['scenario']=='centrale']},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
