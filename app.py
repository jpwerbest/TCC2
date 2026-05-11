from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import os

app = Flask(__name__)
# CORS configurado para permitir que o React (geralmente porta 5173 ou 3000) acesse a API
CORS(app) 

print("Carregando modelo Whisper... Aguarde.")
# Usando o modelo 'base' em CPU. Se tiver GPU NVIDIA, pode trocar para device="cuda"
model = WhisperModel("base", device="cpu", compute_type="int8")
print("Modelo carregado com sucesso!")

# CORREÇÃO: A rota deve ser '/transcribe' para bater com o fetch do React
@app.route('/transcribe', methods=['POST'])
def transcrever_audio():
    # Verifica se o arquivo veio com a chave 'audio'
    if 'audio' not in request.files:
        print("Erro: Chave 'audio' não encontrada no request")
        return jsonify({"error": "Nenhum arquivo de áudio recebido"}), 400
    
    audio_file = request.files['audio']
    temp_path = "temp_recording.webm" # O MediaRecorder do navegador gera .webm por padrão
    
    try:
        audio_file.save(temp_path)
        print(f"Processando áudio...")
        
        # Executa a transcrição
        # beam_size=5 ajuda na precisão
        segments, info = model.transcribe(temp_path, beam_size=5)
        
        texto_final = ""
        for segment in segments:
            texto_final += segment.text + " "
        
        print(f"Transcrição: {texto_final.strip()}")
        
        # CORREÇÃO: O React espera a chave "text", não "texto"
        return jsonify({
            "text": texto_final.strip(),
            "language": info.language
        })

    except Exception as e:
        print(f"Erro no processamento: {e}")
        return jsonify({"error": str(e)}), 500
    
    finally:
        # Limpeza do arquivo temporário para não ocupar espaço
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

if __name__ == '__main__':
    # Roda na porta 5000
    app.run(debug=True, port=5000)