using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;

namespace PartyService
{
    public class PartyService
    {
        private readonly IDistributedCache _redis;
        private readonly IRedisService _redisService;

        public PartyService(IDistributedCache redis, IRedisService redisService)
        {
            _redis = redis;
            _redisService = redisService;
        }

        public async Task<bool> LeavePartyAsync(Guid partyId, Guid userId)
        {
            var exists = await _redis.KeyExistsAsync(partyId.ToString());
            Console.WriteLine($"Key exists before retrieval: {exists}");

            if (!exists) 
            {
                Console.WriteLine($"Party with ID {partyId} does not exist in Redis.");
                return false;
            }

            var partyData = await _redisService.GetAsync<PartyDTO>(partyId);
            if (partyData == null)
            {
                Console.WriteLine($"Party with ID {partyId} not found in Redis.");
                return false;
            }

            partyData.MemberIds.Remove(userId);

            if (partyData.MemberIds.Count == 0) // Changed condition from 1 to 0
            {
                // Delete party only when there are no members left
                await _redis.KeyDeleteAsync(partyId.ToString());
                // Also delete the party cart
                var cartKey = $"party_cart:{partyId}";
                await _redis.KeyDeleteAsync(cartKey);
                Console.WriteLine($"Party {partyId} and its cart deleted from Redis.");
            }
            else
            {
                string jsonData = JsonSerializer.Serialize(partyData);
                await _redis.StringSetAsync(partyId.ToString(), jsonData);
                Console.WriteLine($"Updated party {partyId} in Redis.");
            }

            return true;
        }
    }
} 