# Frontend - Mapa de Cálculo de Distância

Esta é a aplicação frontend desenvolvida com React e TypeScript, utilizando a biblioteca Leaflet para exibição do mapa.

## Funcionalidades

* Exibe um mapa interativo (Leaflet) centralizado em Jacareí-SP.
* Permite ao usuário clicar no mapa para definir um ponto de origem e um ponto de destino.
* Permite ao usuário selecionar uma velocidade média pré-definida (caminhando, bicicleta, carro) ou inserir uma velocidade personalizada para o cálculo de tempo.
* Envia as coordenadas para o backend para obter a distância calculada via PostGIS.
* Exibe os resultados (distância PostGIS, tempo estimado linha reta).
* Oferece um botão para limpar a seleção.
* Oferece um botão para abrir a rota no Google Maps em uma nova aba para comparação visual.

## Scripts Disponíveis

No diretório do projeto, você pode executar:

### `npm start`

Executa o aplicativo no modo de desenvolvimento.\
Abra [http://localhost:3000](http://localhost:3000) para visualizá-lo no navegador.

A página será recarregada se você fizer edições.\
Você também verá quaisquer erros de lint no console.

### `npm run build`

Compila o aplicativo para produção na pasta `build`.\
Ele agrupa corretamente o React no modo de produção e otimiza a compilação para o melhor desempenho.

A compilação é minificada e os nomes dos arquivos incluem os hashes.\
Seu aplicativo está pronto para ser implantado!