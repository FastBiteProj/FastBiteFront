import axios from 'axios';

class ApiManager {
    static async apiRequest(apiData) {
        try {
            const url = ApiManager.buildUrlWithParams(apiData.Url, apiData.Params);

            const config = {
                url,
                method: apiData.Method,
                headers: {
                    'Content-Type': 'application/json',
                    ...apiData.Headers
                },
                data: ApiManager.buildRequestData(apiData.Data, apiData.Headers?.['Content-Type']),
                withCredentials: true,
                credentials: 'include',
            };

            const response = await axios(config);   
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(
                    `API Error: ${error.response.status} ${error.response.statusText}. ${JSON.stringify(error.response.data)}`
                );
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Network Error: Request timeout');
            } else {
                throw new Error(`Network Error: ${error.message}`);
            }
        }
    }

    static buildUrlWithParams(url, params) {
        if (!params) return url;
        const queryString = new URLSearchParams(params).toString();
        return queryString ? `${url}?${queryString}` : url;
    }

    static buildRequestData(data, contentType) {
        if (contentType === 'application/x-www-form-urlencoded') {
            return new URLSearchParams(data).toString();
        }
        return data; 
    }
}

export default ApiManager;