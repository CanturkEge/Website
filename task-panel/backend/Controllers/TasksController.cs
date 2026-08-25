using Microsoft.AspNetCore.Mvc;using TaskPanel.Api.Models;using TaskPanel.Api.Services;
namespace TaskPanel.Api.Controllers;
[ApiController,Route("api/tasks")]public class TasksController(TaskService service):ControllerBase{
  CurrentUser Me=>(CurrentUser)HttpContext.Items["User"]!;
  [HttpGet]public async Task<IActionResult> Get(){try{return Ok(await service.GetAsync(Me));}catch(HttpRequestException e){return BadRequest(new{message=e.Message});}}
  [HttpPost]public async Task<IActionResult> Create(CreateTaskRequest request){try{return StatusCode(201,await service.CreateAsync(request,Me));}catch(HttpRequestException e){return BadRequest(new{message=e.Message});}}
  [HttpPatch("{id:long}/status")]public async Task<IActionResult> Status(long id,UpdateTaskStatusRequest request){try{return await service.UpdateStatusAsync(id,request.Status,Me)?NoContent():NotFound();}catch(ArgumentException e){return BadRequest(new{message=e.Message});}catch(HttpRequestException e){return BadRequest(new{message=e.Message});}}
}
