import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Gift, CalendarHeart, Clock, CheckCircle2, Send, Heart, Copy, Check, Wallet } from 'lucide-react';
import { db } from './firebase';

type RSVPFormData = {
  name: string;
  email?: string;
  whatsapp?: string;
  adults?: number;
  children?: number;
  status: 'confirmado' | 'recusado';
};

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [digitalInvite, setDigitalInvite] = useState<RSVPFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const pixKey = "63992328624";
  const pixName = "Mardila Chayanne Rocha Lopes Santana Soares";

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RSVPFormData>({
    defaultValues: {
      status: 'confirmado',
      adults: 1,
      children: 0
    }
  });

  const status = watch('status');

  const onSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Clean up optional fields by omitting them if empty
      const cleanedData: any = {
        name: data.name,
        status: data.status,
        adults: data.adults ? Number(data.adults) : 0,
        children: data.children ? Number(data.children) : 0,
        createdAt: serverTimestamp()
      };

      if (data.email) cleanedData.email = data.email;
      if (data.whatsapp) cleanedData.whatsapp = data.whatsapp;

      await addDoc(collection(db, 'rsvps'), cleanedData);
      
      setSubmitSuccess(true);
      if (data.status === 'confirmado') {
        setDigitalInvite(data);
      }
    } catch (err: any) {
      console.error('Error submitting RSVP:', err);
      setError(`Erro: ${err.message || 'Desconhecido'}. Por favor, tente novamente.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = (data: RSVPFormData) => {
    const text = `Olá! Confirmo minha presença no casamento de Márdila Chayanne e Wanderson Maciel.\nNome: ${data.name}\nAdultos: ${data.adults || 0}\nCrianças: ${data.children || 0}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-wedding-bg font-sans text-wedding-text selection:bg-wedding-gold selection:text-white pb-20 relative overflow-x-hidden">
      {/* Floral Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 pointer-events-none z-50 opacity-70 -translate-x-20 -translate-y-20 animate-in fade-in zoom-in duration-1000">
        <img 
          src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800&auto=format&fit=crop" 
          alt="" 
          className="w-full h-full object-cover rounded-br-full border-b-8 border-r-8 border-white/50 shadow-2xl rotate-12"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 pointer-events-none z-50 opacity-70 translate-x-20 -translate-y-20 animate-in fade-in zoom-in duration-1000">
        <img 
          src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800&auto=format&fit=crop" 
          alt="" 
          className="w-full h-full object-cover rounded-bl-full border-b-8 border-l-8 border-white/50 shadow-2xl -rotate-12"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Hero Section */}
      <header className="relative py-24 px-6 text-center overflow-hidden flex flex-col items-center justify-center min-h-[60vh]">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://picsum.photos/seed/wedding-flowers/1920/1080?blur=2")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            <p className="font-serif text-lg md:text-xl italic text-wedding-gold-dark leading-relaxed max-w-lg mx-auto">
              "Nem os olhos viram, nem os ouvidos ouviram o que Deus preparou para nós. Um futuro certo, cheio de esperança e paz"
            </p>
            <p className="text-wedding-gold font-medium text-xs mt-2 tracking-widest uppercase">Coríntios 2:9</p>
          </div>
          <p className="text-wedding-gold font-medium tracking-widest uppercase text-sm mb-6">Você está convidado para o casamento de</p>
          <h1 className="font-serif italic text-4xl md:text-6xl lg:text-7xl text-wedding-text mb-6 flex flex-col items-center gap-2">
            <span>Márdila Chayanne</span>
            <span className="text-wedding-gold font-light not-italic text-3xl md:text-5xl">&amp;</span>
            <span>Wanderson Maciel</span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-wedding-muted mt-8">
            <div className="h-px w-12 bg-wedding-gold/50"></div>
            <p className="font-serif text-xl md:text-2xl italic text-wedding-gold-dark">27 de Junho de 2026</p>
            <div className="h-px w-12 bg-wedding-gold/50"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-24">
        
        {/* Details Section */}
        <section className="grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-wedding-gold/20 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-wedding-gold/10 flex items-center justify-center text-wedding-gold-dark mb-6">
              <MapPin size={24} strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-2xl mb-2">Cerimônia Religiosa</h2>
            <p className="text-wedding-muted mb-6 text-sm">Igreja Paróquia Santa Teresinha do Menino Jesus</p>
            <div className="flex items-center gap-2 text-wedding-muted mb-8 text-sm">
              <Clock size={16} />
              <span>19:00h</span>
            </div>
            <a 
              href="https://maps.app.goo.gl/8RMwpQS7C3hK9bBk7?g_st=aw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-2 px-6 py-3 bg-wedding-gold text-white rounded-full hover:bg-wedding-gold-dark transition-colors text-sm font-medium"
            >
              Ver no Mapa
            </a>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-wedding-gold/20 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-wedding-gold/10 flex items-center justify-center text-wedding-gold-dark mb-6">
              <MapPin size={24} strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-2xl mb-2">Recepção</h2>
            <p className="text-wedding-muted mb-8 text-sm">Rancho Carro de Boi</p>
            <a 
              href="https://maps.app.goo.gl/hWnBDbQFLhpDzXRZA?g_st=aw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-2 px-6 py-3 bg-wedding-gold text-white rounded-full hover:bg-wedding-gold-dark transition-colors text-sm font-medium"
            >
              Ver no Mapa
            </a>
          </div>
        </section>

        {/* Gift List */}
        <section className="text-center bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-wedding-gold/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-wedding-gold/20 via-wedding-gold to-wedding-gold/20"></div>
          <div className="w-16 h-16 mx-auto rounded-full bg-wedding-gold/10 flex items-center justify-center text-wedding-gold-dark mb-6">
            <Gift size={32} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-3xl mb-4">Lista de Presentes</h2>
          <p className="text-wedding-muted max-w-lg mx-auto mb-8">
            Sua presença é o nosso maior presente! Mas se desejar nos presentear, criamos uma lista com muito carinho.
          </p>
          <a 
            href="https://lista.havan.com.br/Convidado/ItensListaPresente/925479" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-wedding-text text-white rounded-full hover:bg-black transition-colors font-medium"
          >
            Acessar Lista na Havan
          </a>

          <div className="mt-12 pt-12 border-t border-gray-100">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-4">
              <Wallet size={24} />
            </div>
            <h3 className="font-serif text-2xl mb-2">Presente em Dinheiro</h3>
            <p className="text-wedding-muted mb-6">
              Se preferir nos presentear com qualquer quantia para nossa Lua de Mel, você pode usar o PIX abaixo:
            </p>
            
            <div className="max-w-sm mx-auto bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Chave PIX (Celular)</p>
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 mb-4">
                <span className="font-mono font-medium text-wedding-text">{pixKey}</span>
                <button 
                  onClick={copyPix}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-wedding-gold"
                  title="Copiar Chave"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="text-sm text-wedding-muted italic">
                Favorecida: <br/>
                <span className="font-medium text-wedding-text not-italic">{pixName}</span>
              </p>
            </div>
          </div>
        </section>

        {/* RSVP Section */}
        <section id="rsvp" className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl mb-4">Confirme sua Presença</h2>
            <p className="text-wedding-muted">Por favor, nos informe se poderá comparecer até o dia 10 de Junho de 2026.</p>
          </div>

          {submitSuccess ? (
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-wedding-gold/20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-20 h-20 mx-auto bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-3xl mb-4">
                {digitalInvite ? 'Presença Confirmada!' : 'Agradecemos o aviso!'}
              </h3>
              <p className="text-wedding-muted mb-8">
                {digitalInvite 
                  ? 'Sua presença é muito importante para nós. Abaixo está o seu convite digital para apresentar na entrada.' 
                  : 'Sentiremos sua falta! Agradecemos por nos avisar.'}
              </p>

              {digitalInvite && (
                <div className="mt-8 p-8 border-2 border-dashed border-wedding-gold/40 rounded-2xl bg-wedding-bg relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-wedding-bg px-4 text-wedding-gold-dark font-serif italic">
                    Convite Digital
                  </div>
                  <h4 className="font-serif text-2xl mb-2">{digitalInvite.name}</h4>
                  <p className="text-sm text-wedding-muted mb-6">
                    {digitalInvite.adults} Adulto(s) {digitalInvite.children ? `• ${digitalInvite.children} Criança(s)` : ''}
                  </p>
                  <div className="bg-white p-4 inline-block rounded-xl shadow-sm mb-6">
                    <QRCodeSVG 
                      value={`RSVP:${digitalInvite.name}|A:${digitalInvite.adults}|C:${digitalInvite.children}`} 
                      size={160} 
                      level="H"
                      fgColor="#2C2C2C"
                    />
                  </div>
                  <p className="text-xs text-wedding-muted max-w-xs mx-auto mb-6">
                    Apresente este QR Code na recepção para garantir a entrada da sua família. Tire um print desta tela!
                  </p>
                  
                  <a 
                    href={getWhatsAppLink(digitalInvite)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full hover:bg-[#20bd5a] transition-colors text-sm font-medium w-full justify-center"
                  >
                    <Send size={16} />
                    Enviar Lembrete para meu WhatsApp
                  </a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-wedding-gold/20 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2">Nome Completo *</label>
                <input 
                  {...register('name', { required: 'Nome é obrigatório' })}
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-wedding-gold focus:ring-2 focus:ring-wedding-gold/20 outline-none transition-all"
                  placeholder="Ex: João da Silva"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-wedding-text mb-2">E-mail (Opcional)</label>
                  <input 
                    {...register('email', { 
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "E-mail inválido"
                      }
                    })}
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-wedding-gold focus:ring-2 focus:ring-wedding-gold/20 outline-none transition-all"
                    placeholder="joao@exemplo.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-wedding-text mb-2">WhatsApp (Opcional)</label>
                  <input 
                    {...register('whatsapp')}
                    type="tel" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-wedding-gold focus:ring-2 focus:ring-wedding-gold/20 outline-none transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-wedding-text mb-3">Você poderá comparecer? *</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${status === 'confirmado' ? 'border-wedding-gold bg-wedding-gold/5 text-wedding-gold-dark' : 'border-gray-200 hover:border-wedding-gold/50'}`}>
                    <input type="radio" value="confirmado" {...register('status')} className="sr-only" />
                    <span className="font-medium text-sm">Sim, confirmarei!</span>
                  </label>
                  <label className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${status === 'recusado' ? 'border-wedding-text bg-gray-50 text-wedding-text' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" value="recusado" {...register('status')} className="sr-only" />
                    <span className="font-medium text-sm">Não poderei</span>
                  </label>
                </div>
              </div>

              {status === 'confirmado' && (
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium text-wedding-text mb-2">Adultos</label>
                    <input 
                      {...register('adults', { min: 0 })}
                      type="number" 
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-wedding-gold focus:ring-2 focus:ring-wedding-gold/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wedding-text mb-2">Crianças</label>
                    <input 
                      {...register('children', { min: 0 })}
                      type="number" 
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-wedding-gold focus:ring-2 focus:ring-wedding-gold/20 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-wedding-gold text-white rounded-xl font-medium hover:bg-wedding-gold-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Resposta'}
              </button>
            </form>
          )}
        </section>
      </main>

      <footer className="mt-32 pb-8 text-center text-wedding-muted text-sm flex flex-col items-center justify-center gap-2">
        <Heart size={20} className="text-wedding-gold/50" />
        <p>Com amor, Márdila Chayanne & Wanderson Maciel</p>
        <a href="/admin" className="text-xs text-gray-300 hover:text-wedding-gold mt-4 transition-colors">Acesso Restrito</a>
      </footer>
    </div>
  );
}
