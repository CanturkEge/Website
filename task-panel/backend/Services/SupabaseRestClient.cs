using System.Net.Http.Headers;using System.Text;using System.Text.Json;using TaskPanel.Api.Models;
namespace TaskPanel.Api.Services;
public class SupabaseRestClient(IHttpClientFactory clients,IConfiguration config){
  string Url=>config["Supabase:Url"]!.TrimEnd('/');string Key=>config["Supabase:PublishableKey"]!;
  public async Task<HttpResponseMessage> SendAsync(CurrentUser user,HttpMethod method,string path,object? body=null,bool returnRows=false){using var message=new HttpRequestMessage(method,$"{Url}/rest/v1/{path}");message.Headers.Add("apikey",Key);message.Headers.Authorization=new AuthenticationHeaderValue("Bearer",user.AccessToken);if(returnRows)message.Headers.Add("Prefer","return=representation");if(body is not null)message.Content=new StringContent(JsonSerializer.Serialize(body),Encoding.UTF8,"application/json");return await clients.CreateClient().SendAsync(message);}
  public async Task<HttpResponseMessage> SendAsSecretAsync(HttpMethod method,string path,string secret,object? body=null){using var message=new HttpRequestMessage(method,$"{Url}/rest/v1/{path}");message.Headers.Add("apikey",secret);message.Headers.Add("Prefer","return=representation");if(body is not null)message.Content=new StringContent(JsonSerializer.Serialize(body),Encoding.UTF8,"application/json");return await clients.CreateClient().SendAsync(message);}
}
